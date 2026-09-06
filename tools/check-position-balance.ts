/**
 * CLI: audit answer-position balance of the multiple-choice bank.
 *
 * Usage:
 *   npx tsx tools/check-position-balance.ts -- --version pilot-0.2
 *   (omit --version to audit the latest version)
 *
 * For every (track, axis) group of multiple-choice items, this reports the
 * distribution of the correct-answer position and a chi-square
 * goodness-of-fit statistic against the uniform distribution, compared to
 * the 5% critical value. This audits the BANK-side design invariant
 * (balanced positions neutralize position bias in accuracy scores).
 * Model-side choice-distribution analysis requires per-response files from
 * the runner and is performed separately on the machine holding them.
 */
import { asc, eq } from "drizzle-orm";
import { parseArgs } from "node:util";
import { closeDb, db, schema } from "../server/db";

/** 5% critical values of the chi-square distribution by degrees of freedom. */
const CHI2_CRIT_05: Record<number, number> = {
  1: 3.841,
  2: 5.991,
  3: 7.815,
  4: 9.488,
  5: 11.07,
};

interface GroupStats {
  track: string;
  axis: string;
  n: number;
  counts: Map<number, number>;
  choiceCounts: Set<number>;
}

function chiSquareUniform(counts: number[], total: number): number {
  const kCats = counts.length;
  if (kCats < 2 || total === 0) return 0;
  const expected = total / kCats;
  return counts.reduce((acc, c) => acc + ((c - expected) ** 2) / expected, 0);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: { version: { type: "string" } },
    allowPositionals: true,
  });

  const versions = await db
    .select()
    .from(schema.benchmarkVersions)
    .orderBy(asc(schema.benchmarkVersions.createdAt));
  if (versions.length === 0) {
    console.error("No benchmark versions found.");
    process.exit(1);
  }
  const target = values.version
    ? versions.find((v) => v.label === values.version)
    : versions[versions.length - 1];
  if (!target) {
    console.error(
      `Version "${values.version}" not found. Available: ` +
        versions.map((v) => v.label).join(", "),
    );
    process.exit(1);
  }

  const rows = await db
    .select({
      track: schema.items.track,
      axis: schema.items.axis,
      payload: schema.items.payload,
    })
    .from(schema.items)
    .where(eq(schema.items.versionId, target.id));

  const groups = new Map<string, GroupStats>();
  let skipped = 0;

  for (const row of rows) {
    const payload = row.payload as Record<string, unknown> | null;
    const choices = payload?.["choices"];
    const correct = payload?.["correct_answer"];
    if (!Array.isArray(choices) || typeof correct !== "number") {
      skipped += 1;
      continue; // not a multiple-choice item (open_generation / extraction)
    }
    const key = `${row.track}/${row.axis}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        track: row.track,
        axis: row.axis,
        n: 0,
        counts: new Map(),
        choiceCounts: new Set(),
      };
      groups.set(key, g);
    }
    g.n += 1;
    g.counts.set(correct, (g.counts.get(correct) ?? 0) + 1);
    g.choiceCounts.add(choices.length);
  }

  console.log(
    `Answer-position balance audit - version "${target.label}" ` +
      `(${rows.length} public items scanned, ${skipped} non-MC skipped)\n`,
  );

  const header = [
    "track/axis".padEnd(28),
    "n".padStart(4),
    "positions (0..k-1)".padEnd(26),
    "chi2".padStart(7),
    "crit05".padStart(7),
    "verdict",
  ].join("  ");
  console.log(header);
  console.log("-".repeat(header.length));

  let anyImbalance = false;
  const sorted = [...groups.values()].sort((a, b) =>
    `${a.track}/${a.axis}`.localeCompare(`${b.track}/${b.axis}`),
  );

  for (const g of sorted) {
    const kCats = Math.max(...g.choiceCounts);
    const counts: number[] = [];
    for (let i = 0; i < kCats; i += 1) counts.push(g.counts.get(i) ?? 0);
    const chi2 = chiSquareUniform(counts, g.n);
    const df = kCats - 1;
    const crit = CHI2_CRIT_05[df] ?? NaN;
    const balanced = Number.isFinite(crit) ? chi2 <= crit : true;
    if (!balanced) anyImbalance = true;
    if (g.choiceCounts.size > 1) {
      console.log(
        `NOTE: ${g.track}/${g.axis} mixes choice counts: ` +
          [...g.choiceCounts].sort().join(","),
      );
    }
    console.log(
      [
        `${g.track}/${g.axis}`.padEnd(28),
        String(g.n).padStart(4),
        `[${counts.join(", ")}]`.padEnd(26),
        chi2.toFixed(2).padStart(7),
        (Number.isFinite(crit) ? crit.toFixed(2) : "-").padStart(7),
        balanced ? "balanced" : "IMBALANCED",
      ].join("  "),
    );
  }

  console.log(
    "\n" +
      (anyImbalance
        ? "RESULT: at least one group deviates from uniform at the 5% level."
        : "RESULT: no group deviates from uniform at the 5% level - " +
          "the balanced-positions design invariant holds."),
  );

  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
