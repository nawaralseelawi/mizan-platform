/**
 * Imports an offline evaluation run (mizan-results-v1 JSON produced by the
 * harness wrapper) into models / evaluation_runs / axis_results.
 */
import { and, eq } from "drizzle-orm";
import { EvaluationResultsFileSchema, type EvaluationResultsFile } from "@shared/types";
import { db, schema } from "../db";
import { computeVerificationHash } from "./certificates";

export interface ResultsImportSummary {
  model: string;
  runId: number;
  axesImported: number;
  verificationHash: string;
}

export function parseResultsFile(raw: string): EvaluationResultsFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Results file is not valid JSON: ${(e as Error).message}`);
  }
  const result = EvaluationResultsFileSchema.safeParse(parsed);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Results file failed validation:\n${details}`);
  }
  return result.data;
}

async function getOrCreateModel(
  file: EvaluationResultsFile,
): Promise<number> {
  const { name, developer } = file.model;
  const existing = await db
    .select({ id: schema.models.id })
    .from(schema.models)
    .where(
      and(eq(schema.models.name, name), eq(schema.models.developer, developer)),
    )
    .limit(1);
  const row = existing[0];
  if (row) return row.id;

  const inserted = await db
    .insert(schema.models)
    .values({
      name,
      developer,
      parameters: file.model.parameters ?? null,
      license: file.model.license ?? null,
      source: file.model.source ?? null,
    })
    .returning({ id: schema.models.id });
  const created = inserted[0];
  if (!created) throw new Error("Failed to create model");
  return created.id;
}

async function requireVersion(label: string): Promise<number> {
  const rows = await db
    .select({ id: schema.benchmarkVersions.id })
    .from(schema.benchmarkVersions)
    .where(eq(schema.benchmarkVersions.label, label))
    .limit(1);
  const row = rows[0];
  if (!row) {
    throw new Error(
      `Unknown benchmark_version "${label}". Import its items first so results can be traced to a known item set.`,
    );
  }
  return row.id;
}

export async function importResults(
  file: EvaluationResultsFile,
  importedBy: number | null,
): Promise<ResultsImportSummary> {
  const modelId = await getOrCreateModel(file);
  const versionId = await requireVersion(file.benchmark_version);

  return db.transaction(async (tx) => {
    const runRows = await tx
      .insert(schema.evaluationRuns)
      .values({
        modelId,
        versionId,
        completedAt: new Date(file.run.completed_at),
        harnessCommit: file.run.harness_commit,
        config: file.run.config,
        importedBy,
      })
      .returning({ id: schema.evaluationRuns.id });
    const run = runRows[0];
    if (!run) throw new Error("Failed to create evaluation run");

    for (const r of file.results) {
      await tx.insert(schema.axisResults).values({
        runId: run.id,
        track: r.track,
        axis: r.axis,
        tier: r.tier,
        score: r.score,
        ciLow: r.ci_low ?? null,
        ciHigh: r.ci_high ?? null,
        nItems: r.n_items,
      });
    }

    const verificationHash = computeVerificationHash({
      runId: run.id,
      modelName: file.model.name,
      developer: file.model.developer,
      versionLabel: file.benchmark_version,
      results: file.results,
    });

    return {
      model: file.model.name,
      runId: run.id,
      axesImported: file.results.length,
      verificationHash,
    };
  });
}

