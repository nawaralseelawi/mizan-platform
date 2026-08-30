/**
 * Batch runner: evaluate a curated line-up of OpenRouter models over the
 * pilot bank and import each result, in one command. Publishing stays a
 * manual, human-reviewed step in the dashboard (no blind auto-ranking).
 *
 * Usage:  npm run batch
 *
 * Model ids must match OpenRouter exactly - verify with `npm run list:models`.
 * Claude Haiku/Sonnet are evaluated separately via the anthropic provider
 * and are already on the board; this list is the OpenRouter line-up (18),
 * giving 20 models total with the two Claude runs.
 */
import "../server/env"; // auto-loads .env
import { execFileSync } from "node:child_process";

interface ModelSpec {
  model: string;
  developer: string;
  out: string;
}

// Curated 18-model OpenRouter line-up: leading commercial + strong open +
// a range of sizes and vendors. Verified against the live catalog.
const MODELS: ModelSpec[] = [
  // Commercial frontier
  // COMPLETED before power cut (runs #143-145) - re-enable for future full runs
  //{ model: "openai/gpt-5", developer: "OpenAI", out: "data/results-gpt5.json" },
  // COMPLETED before power cut (runs #143-145) - re-enable for future full runs
  //{ model: "openai/gpt-4o", developer: "OpenAI", out: "data/results-gpt4o.json" },
  // COMPLETED before power cut (runs #143-145) - re-enable for future full runs
  //{ model: "google/gemini-2.5-pro", developer: "Google", out: "data/results-gemini25pro.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "google/gemini-2.5-flash", developer: "Google", out: "data/results-gemini25flash.json" },
  // Strong open-weight (large)
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "meta-llama/llama-3.3-70b-instruct", developer: "Meta", out: "data/results-llama33.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "meta-llama/llama-4-maverick", developer: "Meta", out: "data/results-llama4mav.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "qwen/qwen-2.5-72b-instruct", developer: "Alibaba", out: "data/results-qwen25.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "qwen/qwen3-235b-a22b-2507", developer: "Alibaba", out: "data/results-qwen3.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "deepseek/deepseek-v3.2", developer: "DeepSeek", out: "data/results-deepseek.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "deepseek/deepseek-chat-v3.1", developer: "DeepSeek", out: "data/results-deepseek31.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "mistralai/mistral-large-2512", developer: "Mistral", out: "data/results-mistrallarge.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "mistralai/mistral-small-3.2-24b-instruct", developer: "Mistral", out: "data/results-mistralsmall.json" },
  // Mid / smaller open-weight (size-effect signal)
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "google/gemma-3-27b-it", developer: "Google", out: "data/results-gemma3-27.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "google/gemma-4-31b-it", developer: "Google", out: "data/results-gemma4-31.json" },
  // COMPLETED (runs #146-157) - re-enable for future full runs
  //{ model: "meta-llama/llama-3.1-8b-instruct", developer: "Meta", out: "data/results-llama31-8b.json" },
  { model: "qwen/qwen3-32b", developer: "Alibaba", out: "data/results-qwen3-32b.json" },
  { model: "mistralai/ministral-8b-2512", developer: "Mistral", out: "data/results-ministral8b.json" },
  { model: "openai/gpt-oss-120b", developer: "OpenAI", out: "data/results-gptoss120b.json" },
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

  console.log("\n\n========== BATCH SUMMARY ==========");
  for (const r of results) {
    console.log(`${r.ok ? "OK  " : "FAIL"}  ${r.model.padEnd(44)} ${r.note}`);
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(`\n${ok}/${results.length} models evaluated + imported.`);
  console.log("Next: open the dashboard and Publish the runs you want on the leaderboard.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });

