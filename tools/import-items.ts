/**
 * CLI: import a Sumer JSONL export into the platform database.
 *
 * Usage:
 *   pnpm import:items -- --file fixtures/sample-items.jsonl --version pilot-0.1
 *
 * Behavior:
 *   - Validates every line first; if ANY line fails, nothing is imported
 *     and a full error report is printed (all-or-nothing by default).
 *   - public_dev items are stored with content; private_test items are
 *     reduced to a hash manifest before touching the database.
 */
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { closeDb } from "../server/db";
import { importItems } from "../server/services/item-importer";
import { validateJsonl } from "../server/services/jsonl-validator";

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      file: { type: "string" },
      version: { type: "string" },
    },
  });
  if (!values.file || !values.version) {
    console.error(
      "Usage: pnpm import:items -- --file <path.jsonl> --version <label>",
    );
    process.exit(2);
  }

  const content = await readFile(values.file, "utf8");
  const report = validateJsonl(content);

  if (report.errors.length > 0) {
    console.error(`Validation failed: ${report.errors.length} bad line(s).`);
    for (const err of report.errors) {
      console.error(`  line ${err.lineNumber}:`);
      for (const msg of err.messages) console.error(`    - ${msg}`);
    }
    process.exit(1);
  }

  const summary = await importItems(values.version, report.valid);
  console.log(
    `Imported into version "${summary.versionLabel}": ` +
      `${summary.publicStored} public item(s) stored, ` +
      `${summary.privateManifested} private item(s) manifested (content discarded).`,
  );
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => closeDb());

