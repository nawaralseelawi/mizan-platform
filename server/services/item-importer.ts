/**
 * Imports validated benchmark items into the database.
 *
 * Contamination-control invariant enforced here, not merely documented:
 *   - public_dev items  -> full content stored in `items`
 *   - private_test items -> ONLY metadata + hash stored in
 *     `private_item_manifest`; prompt/choices/answers are discarded
 *     before any database call.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import type { ValidatedLine } from "./jsonl-validator";

export interface ImportSummary {
  versionLabel: string;
  publicStored: number;
  privateManifested: number;
}

export async function getOrCreateVersion(label: string): Promise<number> {
  const existing = await db
    .select()
    .from(schema.benchmarkVersions)
    .where(eq(schema.benchmarkVersions.label, label))
    .limit(1);
  const row = existing[0];
  if (row) {
    if (row.isFrozen) {
      throw new Error(
        `Benchmark version "${label}" is frozen; imports are rejected`,
      );
    }
    return row.id;
  }
  const inserted = await db
    .insert(schema.benchmarkVersions)
    .values({ label })
    .returning({ id: schema.benchmarkVersions.id });
  const created = inserted[0];
  if (!created) throw new Error("Failed to create benchmark version");
  return created.id;
}

export async function importItems(
  versionLabel: string,
  lines: ValidatedLine[],
): Promise<ImportSummary> {
  const versionId = await getOrCreateVersion(versionLabel);
  let publicStored = 0;
  let privateManifested = 0;

  await db.transaction(async (tx) => {
    for (const { item, contentHash } of lines) {
      const common = {
        versionId,
        itemId: item.item_id,
        track: item.track,
        axis: item.axis,
        questionFormat: item.question_format,
        difficulty: item.difficulty,
        dialectRegion: item.dialect_region,
        contentHash,
      };

      if (item.contamination_tier === "private_test") {
        // Content is intentionally dropped. Only the manifest row persists.
        await tx
          .insert(schema.privateItemManifest)
          .values(common)
          .onConflictDoNothing();
        privateManifested++;
        continue;
      }

      const payload =
        item.question_format === "multiple_choice"
          ? { choices: item.choices, correct_answer: item.correct_answer }
          : item.question_format === "extraction"
            ? { ground_truth: item.ground_truth }
            : { rubric_id: item.rubric_id, reference: item.reference ?? null };

      await tx
        .insert(schema.items)
        .values({
          ...common,
          prompt: item.prompt,
          context: item.context ?? null,
          payload,
        })
        .onConflictDoNothing();
      publicStored++;
    }
  });

  return { versionLabel, publicStored, privateManifested };
}

