/**
 * CLI: list models available on OpenRouter, filtered to the families Mizan
 * cares about, with live pricing. Uses OPENROUTER_API_KEY from .env.
 *
 * Usage:  npm run list:models
 *         npm run list:models -- --all          (show everything)
 *         npm run list:models -- --filter qwen  (custom filter)
 *
 * This exists because OpenRouter's catalog changes weekly; never hard-code
 * a model id from memory - read the live list and copy the exact id.
 */
import "../server/env"; // auto-loads .env (dotenv)
import { parseArgs } from "node:util";

interface ORModel {
  id: string;
  name: string;
  pricing?: { prompt?: string; completion?: string };
  context_length?: number;
}

async function main() {
  const { values } = parseArgs({
    options: {
      all: { type: "boolean", default: false },
      filter: { type: "string" },
    },
  });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error("OPENROUTER_API_KEY is not set in .env");
    process.exit(1);
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.error(`OpenRouter error ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const data = (await res.json()) as { data: ORModel[] };

  // Families relevant to a benchmark comparison (edit freely).
  const families = ["gpt", "openai", "llama", "meta-llama", "qwen", "gemma", "google", "jais", "mistral", "deepseek", "claude", "anthropic"];
  const customFilter = values.filter?.toLowerCase();

  const rows = data.data
    .filter((m) => {
      if (values.all) return true;
      const id = m.id.toLowerCase();
      if (customFilter) return id.includes(customFilter);
      return families.some((f) => id.includes(f));
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const fmtPrice = (p?: string) => {
    if (p == null) return "?";
    const perM = (parseFloat(p) * 1_000_000).toFixed(2);
    return `$${perM}/M`;
  };

  console.log(`\nOpenRouter models (${rows.length} shown)\n`);
  console.log("MODEL ID".padEnd(48), "IN".padEnd(11), "OUT".padEnd(11), "CTX");
  console.log("-".repeat(84));
  for (const m of rows) {
    const inP = fmtPrice(m.pricing?.prompt);
    const outP = fmtPrice(m.pricing?.completion);
    const ctx = m.context_length ? `${Math.round(m.context_length / 1000)}K` : "?";
    console.log(m.id.padEnd(48), inP.padEnd(11), outP.padEnd(11), ctx);
  }
  console.log(
    "\nCopy an exact MODEL ID above into --model when running an eval.\n" +
      "Tip: prefer stable paid models over :free ones for a benchmark (free rotate/rate-limit).\n",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
