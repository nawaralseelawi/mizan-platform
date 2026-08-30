/**
 * Certificate issuance and verification.
 *
 * A certificate is issued exactly once per published run. Its verification
 * hash is deterministic over the run's identity and published axis scores,
 * so anyone holding the hash can later confirm the platform still attests
 * to the same numbers.
 */
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";

export function computeVerificationHash(input: {
  runId: number;
  modelName: string;
  developer: string;
  versionLabel: string;
  results: { track: string; axis: string; tier: string; score: number }[];
}): string {
  const digestInput = [
    String(input.runId),
    input.modelName,
    input.developer,
    input.versionLabel,
    ...input.results
      .slice()
      .sort((a, b) =>
        `${a.track}:${a.axis}:${a.tier}`.localeCompare(
          `${b.track}:${b.axis}:${b.tier}`,
        ),
      )
      .map((r) => `${r.track}:${r.axis}:${r.tier}:${r.score.toFixed(6)}`),
  ].join("|");
  return createHash("sha256").update(digestInput, "utf8").digest("hex");
}

export async function issueCertificateForRun(runId: number): Promise<string> {
  const runRows = await db
    .select({
      runId: schema.evaluationRuns.id,
      modelName: schema.models.name,
      developer: schema.models.developer,
      versionLabel: schema.benchmarkVersions.label,
    })
    .from(schema.evaluationRuns)
    .innerJoin(schema.models, eq(schema.evaluationRuns.modelId, schema.models.id))
    .innerJoin(
      schema.benchmarkVersions,
      eq(schema.evaluationRuns.versionId, schema.benchmarkVersions.id),
    )
    .where(eq(schema.evaluationRuns.id, runId))
    .limit(1);
  const run = runRows[0];
  if (!run) throw new Error(`Run ${runId} not found`);

  const results = await db
    .select({
      track: schema.axisResults.track,
      axis: schema.axisResults.axis,
      tier: schema.axisResults.tier,
      score: schema.axisResults.score,
    })
    .from(schema.axisResults)
    .where(eq(schema.axisResults.runId, runId));
  if (results.length === 0) {
    throw new Error(`Run ${runId} has no axis results; cannot certify`);
  }

  const verificationHash = computeVerificationHash({ ...run, results });

  const existing = await db
    .select({ id: schema.certificates.id })
    .from(schema.certificates)
    .where(eq(schema.certificates.runId, runId))
    .limit(1);
  if (existing[0]) {
    // Re-publishing a previously retracted run reactivates its certificate.
    await db
      .update(schema.certificates)
      .set({ revokedAt: null, verificationHash })
      .where(eq(schema.certificates.runId, runId));
    return verificationHash;
  }

  await db
    .insert(schema.certificates)
    .values({ runId, verificationHash });
  return verificationHash;
}

export async function revokeCertificateForRun(runId: number): Promise<void> {
  await db
    .update(schema.certificates)
    .set({ revokedAt: new Date() })
    .where(eq(schema.certificates.runId, runId));
}

