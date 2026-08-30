/**
 * CLI: import an offline evaluation run (mizan-results-v1 JSON).
 *
 * Usage:
 *   pnpm import:results -- --file fixtures/sample-results.json
 *
 * Runs enter with status "imported"; publishing to the leaderboard is a
 * separate explicit admin action so that no result appears publicly
 * without human sign-off.
 */
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { closeDb } from "../server/db";
import {
  importResults,
  parseResultsFile,
} from "../server/services/results-importer";

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: { file: { type: "string" } },
  });
  if (!values.file) {
    console.error("Usage: pnpm import:results -- --file <path.json>");
    process.exit(2);
  }

  const raw = await readFile(values.file, "utf8");
  const file = parseResultsFile(raw);
  const summary = await importResults(file, null);
  console.log(
    `Run #${summary.runId} imported for "${summary.model}" ` +
      `(${summary.axesImported} axis result(s)).`,
  );
  console.log(`Verification hash: ${summary.verificationHash}`);
  console.log(
    'Status is "imported". Publish it explicitly after review to appear on the leaderboard.',
  );
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => closeDb());

