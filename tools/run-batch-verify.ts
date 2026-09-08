/**
 * Verification round: re-evaluate every published model under the HARDENED
 * harness (empty-response retry ladder) with per-item details captured.
 *
 * Purpose: the 18 pre-hardening runs have no retained console logs, so
 * silent low-rate empty responses cannot be ruled out retroactively.
 * This round makes the paper table verifiably empty-free and yields
 * run-to-run agreement data for every model. New runs are dated snapshots;
 * publishing them (manual, per model) supersedes the old ones on the
 * board without deleting history.
 *
 * Excluded (already executed today): anthropic/claude-fable-5 (clean
 * diagnostic run pending the probe verdict) and silma-9b-instruct
 * (log-verified zero empties).
 *
 * claude-sonnet-4-5 and claude-haiku-4-5 run via the DIRECT Anthropic
 * provider under their exact published names, so the board keeps one
 * entry per model. Requires ANTHROPIC_API_KEY in .env.
 *
 * Usage:  npx tsx tools/run-batch-verify.ts
 * Order: cheapest first, so an early failure cannot burn the budget.
 */
import "../server/env"; // auto-loads .env
import { execFileSync } from "node:child_process";

interface ModelSpec {
  provider: "openrouter" | "anthropic";
  model: string;
  developer: string;
  slug: string;
}

const MODELS: ModelSpec[] = [
  { provider: "openrouter", model: "meta-llama/llama-3.1-8b-instruct", developer: "Meta", slug: "llama31-8b" },
  { provider: "openrouter", model: "mistralai/ministral-8b-2512", developer: "Mistral", slug: "ministral-8b" },
  { provider: "openrouter", model: "mistralai/mistral-saba", developer: "Mistral", slug: "saba" },
  { provider: "openrouter", model: "qwen/qwen-2.5-72b-instruct", developer: "Alibaba", slug: "qwen25-72b" },
  { provider: "openrouter", model: "qwen/qwen3-32b", developer: "Alibaba", slug: "qwen3-32b" },
  { provider: "openrouter", model: "mistralai/mistral-small-3.2-24b-instruct", developer: "Mistral", slug: "mistral-small" },
  { provider: "openrouter", model: "google/gemma-3-27b-it", developer: "Google", slug: "gemma3-27b" },
  { provider: "openrouter", model: "mistralai/mistral-large-2512", developer: "Mistral", slug: "mistral-large" },
  { provider: "openrouter", model: "deepseek/deepseek-v3.2", developer: "DeepSeek", slug: "deepseek-v32" },
  { provider: "openrouter", model: "deepseek/deepseek-chat-v3.1", developer: "DeepSeek", slug: "deepseek-v31" },
  { provider: "openrouter", model: "google/gemma-4-31b-it", developer: "Google", slug: "gemma4-31b" },
  { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct", developer: "Meta", slug: "llama33-70b" },
  { provider: "openrouter", model: "qwen/qwen3-235b-a22b-2507", developer: "Alibaba", slug: "qwen3-235b" },
  { provider: "openrouter", model: "meta-llama/llama-4-maverick", developer: "Meta", slug: "llama4-maverick" },
  { provider: "openrouter", model: "openai/gpt-oss-120b", developer: "OpenAI", slug: "gpt-oss-120b" },
  { provider: "openrouter", model: "google/gemini-2.5-flash", developer: "Google", slug: "gemini25-flash" },
  { provider: "openrouter", model: "openai/gpt-4o", developer: "OpenAI", slug: "gpt-4o" },
  { provider: "anthropic", model: "claude-haiku-4-5", developer: "Anthropic", slug: "haiku45" },
  { provider: "openrouter", model: "openai/gpt-5", developer: "OpenAI", slug: "gpt-5" },
  { provider: "openrouter", model: "google/gemini-2.5-pro", developer: "Google", slug: "gemini25-pro" },
  { provider: "anthropic", model: "claude-sonnet-4-5", developer: "Anthropic", slug: "sonnet45" },
  { provider: "openrouter", model: "anthropic/claude-sonnet-5", developer: "Anthropic", slug: "sonnet5" },
  { provider: "openrouter", model: "anthropic/claude-opus-5", developer: "Anthropic", slug: "opus5" },
  { provider: "openrouter", model: "openai/gpt-6-astra", developer: "OpenAI", slug: "astra" },
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
    const out = `data/verify-results-${m.slug}.json`;
    const details = `data/verify-details-${m.slug}.json`;
    console.log(`\n=== [verify] ${m.model} (${m.provider}) ===`);
    try {
      run("npx", [
        "tsx", "runner/run.ts",
        "--items", ITEMS1,
        "--provider", m.provider,
        "--model", m.model,
        "--developer", m.developer,
        "--version", VERSION,
        "--out", out,
        "--details", details,
      ]);
      run("npx", ["tsx", "tools/import-results.ts", "--file", out]);
      results.push({ model: m.model, ok: true, note: "verified + imported" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`\n!! ${m.model} failed: ${msg}\n`);
      results.push({ model: m.model, ok: false, note: (msg.split("\n")[0] ?? "error") });
    }
  }

  console.log("\n\n========== VERIFICATION ROUND SUMMARY ==========");
  for (const r of results) {
    console.log(`${r.ok ? "OK  " : "FAIL"}  ${r.model.padEnd(44)} ${r.note}`);
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(`\n${ok}/${results.length} models verified + imported.`);
  console.log(
    "Next: review per-run axis scores, then publish each run manually - " +
      "the human gate. Console lines starting with '!' mean residual " +
      "failures that survived the retry ladder: investigate before publishing.\n",
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
