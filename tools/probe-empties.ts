/**
 * Diagnostic probe for deterministic empty responses.
 *
 * Sends the stubborn items (empty across three independent Fable runs,
 * surviving the retry ladder) through BOTH paths - OpenRouter and the
 * direct Anthropic API - and prints the raw response envelope (finish
 * reason, usage, refusal fields, content) for each. This separates two
 * hypotheses with opposite methodological consequences:
 *   (a) model-level refusal  -> the zero is earned; report as over-refusal
 *   (b) gateway-level filter -> the zero is infrastructure; switch paths
 *
 * Usage: npx tsx tools/probe-empties.ts
 * Cost: a few cents. Purely diagnostic - nothing is imported.
 */
import { readFile } from "node:fs/promises";
import { config } from "dotenv";
config();
import { parseBenchmarkItem, type BenchmarkItem } from "@shared/types";
import { buildPrompt } from "../runner/score";

const STUBBORN_IDS = [
  "MZN-I-DC-0001",
  "MZN-I-DC-0002",
  "MZN-I-DC-0003",
  "MZN-I-DC-0014",
  "MZN-I-DC-0023",
  "MZN-I-DC-0040",
  "MZN-I-KNO-0029",
];

const BANK = "data/pilot-0.2-all.jsonl";
const OPENROUTER_MODEL = "anthropic/claude-fable-5";
const ANTHROPIC_MODEL = "claude-fable-5";
const MAX_TOKENS = 8192;

async function loadStubborn(): Promise<BenchmarkItem[]> {
  const content = await readFile(BANK, "utf8");
  const items: BenchmarkItem[] = [];
  for (const line of content.split(/\r?\n/)) {
    if (line.trim().length === 0) continue;
    const parsed = parseBenchmarkItem(JSON.parse(line));
    if (parsed.ok && STUBBORN_IDS.includes(parsed.item.item_id)) {
      items.push(parsed.item);
    }
  }
  return items;
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + " ...[truncated]" : s;
}

async function probeOpenRouter(item: BenchmarkItem): Promise<void> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.log("  [openrouter] OPENROUTER_API_KEY not set - skipped");
    return;
  }
  const { system, prompt } = buildPrompt(item);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });
  const text = await res.text();
  console.log(`  [openrouter] HTTP ${res.status}`);
  console.log(`  [openrouter] body: ${trunc(text, 1400)}`);
}

async function probeAnthropic(item: BenchmarkItem): Promise<void> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.log("  [anthropic] ANTHROPIC_API_KEY not set - skipped");
    return;
  }
  const { system, prompt } = buildPrompt(item);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const text = await res.text();
  console.log(`  [anthropic]  HTTP ${res.status}`);
  console.log(`  [anthropic]  body: ${trunc(text, 1400)}`);
}

async function main(): Promise<void> {
  const items = await loadStubborn();
  console.log(
    `Probing ${items.length}/${STUBBORN_IDS.length} stubborn items via both paths...\n`,
  );
  for (const item of items) {
    console.log(`=== ${item.item_id} (${item.track}/${item.axis}) ===`);
    await probeOpenRouter(item);
    await probeAnthropic(item);
    console.log("");
  }
  console.log(
    "Done. Read finish_reason / refusal / content in each body above.",
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
