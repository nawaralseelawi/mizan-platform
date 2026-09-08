/**
 * Item-2a batch: NEW evaluation runs only, on the frozen pilot-0.2 bank.
 * The existing published runs are dated snapshots and are never re-run.
 *
 * Usage:  npx tsx tools/run-batch-item2.ts
 *
 * Line-up (verified against the live OpenRouter catalog on 2026-09-06 via
 * `npm run list:models` - never from memory):
 *   1-2. Clean re-runs of the two retracted wounded runs (#149, #153).
 *   3.   mistralai/mistral-saba - the only Arabic/Middle-East-specialized
 *        model available on OpenRouter (Jais/ALLaM/AceGPT/SILMA/Fanar are
 *        not hosted there; they require self-hosted weights - future work).
 *   4-6. Claude 5 family (Sonnet / Opus / Fable).
 *   7.   GPT-6 Astra (released 2026-09-03).
 *
 * Ordered cheapest-first so an early failure cannot burn the budget.
 * Reasoning-model caution: the runner already uses max_tokens 2048 (the
 * documented GPT-5 lesson). If Astra or Fable show near-zero scores on a
 * track, treat it as the empty-response disease: do NOT publish, report.
 * Publishing stays a manual dashboard step - the human gate is the last
 * line of defense against wounded runs.
 */
import "../server/env"; // auto-loads .env
import { execFileSync } from "node:child_process";

interface ModelSpec {
  model: string;
  developer: string;
  out: string;
}

const MODELS: ModelSpec[] = [
  // --- Clean re-runs of retracted runs (pennies) ---
  { model: "qwen/qwen-2.5-72b-instruct", developer: "Alibaba", out: "data/results-qwen25-rerun.json" },
  { model: "mistralai/mistral-large-2512", developer: "Mistral", out: "data/results-mistrallarge-rerun.json" },
  // --- Arabic/Middle-East-specialized (the one available via API) ---
  { model: "mistralai/mistral-saba", developer: "Mistral", out: "data/results-saba.json" },
  // --- Claude 5 family ---
  { model: "anthropic/claude-sonnet-5", developer: "Anthropic", out: "data/results-sonnet5.json" },
  { model: "anthropic/claude-opus-5", developer: "Anthropic", out: "data/results-opus5.json" },
  { model: "anthropic/claude-fable-5", developer: "Anthropic", out: "data/results-fable5.json" },
  // --- Newest frontier ---
  { model: "openai/gpt-6-astra", developer: "OpenAI", out: "data/results-astra.json" },
];

const ITEMS1 = "data/pilot-0.2-all.jsonl";
const VERSION = "pilot-0.2";

function run(cmd: string, args: string[]) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
}

async function main() {
  const results: { model: string; ok: boolean; note: string }[] = [];

  for (const m of MODELS) {
    console.log(`\n=== Evaluating ${m.model} (${m.developer}) ===`);
    try {
      run("npx", [
        "tsx", "runner/run.ts",
        "--items", ITEMS1,
        "--provider", "openrouter",
        "--model", m.model,
        "--developer", m.developer,
        "--version", VERSION,
        "--out", m.out,
      ]);
      run("npx", ["tsx", "tools/import-results.ts", "--file", m.out]);
      results.push({ model: m.model, ok: true, note: "evaluated + imported" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`\n!! ${m.model} failed: ${msg}\n`);
      results.push({ model: m.model, ok: false, note: (msg.split("\n")[0] ?? "error") });
    }
  }

  console.log("\n\n========== ITEM-2A BATCH SUMMARY ==========");
  for (const r of results) {
    console.log(`${r.ok ? "OK  " : "FAIL"}  ${r.model.padEnd(44)} ${r.note}`);
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(`\n${ok}/${results.length} models evaluated + imported.`);
  console.log(
    "Next: BEFORE publishing, sanity-check each run's per-axis scores in the " +
      "dashboard (no near-zero tracks). Then Publish - the human gate.\n",
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
