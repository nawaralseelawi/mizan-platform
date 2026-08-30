/**
 * Diagnostic: run a single model over the first N multiple-choice items and
 * print, for each, the RAW model response and the extracted answer letter.
 * Reveals why a model scores low (empty replies, reasoning that eats the
 * token budget, refusals, or an unexpected answer format).
 *
 * Usage:
 *   npm run debug:model -- --provider openrouter --model openai/gpt-5 --n 8
 *   npm run debug:model -- --provider openrouter --model openai/gpt-4o --n 8
 */
import "dotenv/config"; // load .env (diagnostic tool needs only the API key)
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { parseBenchmarkItem } from "@shared/types";
import { callModel, type ProviderName } from "../runner/providers";
import { buildPrompt, scoreMultipleChoice } from "../runner/score";

const LETTERS = ["A", "B", "C", "D", "E"];

async function main() {
  const { values } = parseArgs({
    options: {
      provider: { type: "string" },
      model: { type: "string" },
      n: { type: "string", default: "8" },
      maxtokens: { type: "string" },
    },
  });
  const provider = values.provider as ProviderName;
  const model = values.model!;
  const n = parseInt(values.n ?? "8", 10);
  const maxTokens = values.maxtokens ? parseInt(values.maxtokens, 10) : undefined;

  const files = ["data/pilot-0.1-part1.jsonl", "data/pilot-0.1-part2.jsonl"];
  const items = [];
  for (const f of files) {
    const raw = await readFile(f, "utf8");
    for (const line of raw.split("\n").filter((l) => l.trim())) {
      const parsed = parseBenchmarkItem(JSON.parse(line));
      if (parsed.ok) items.push(parsed.item);
    }
  }
  const mc = items.filter((it) => it.question_format === "multiple_choice").slice(0, n);

  console.log(`\nDebugging ${provider}/${model} on ${mc.length} MC items` +
    (maxTokens ? ` (max_tokens=${maxTokens})` : "") + `\n${"=".repeat(70)}`);

  let correct = 0;
  for (const item of mc) {
    const { system, prompt } = buildPrompt(item);
    let raw = "";
    let err = "";
    try {
      raw = await callModel(provider, { model, prompt, system, maxTokens });
    } catch (e) {
      err = (e as Error).message;
    }
    const score = err ? 0 : scoreMultipleChoice(item as never, raw);
    correct += score;
    const expected = LETTERS[(item as { correct_answer: number }).correct_answer];
    console.log(`\n[${(item as { item_id: string }).item_id}] expected=${expected} score=${score}`);
    if (err) console.log(`  ERROR: ${err}`);
    else console.log(`  RAW (${raw.length} chars): ${JSON.stringify(raw.slice(0, 200))}`);
  }
  console.log(`\n${"=".repeat(70)}\n${correct}/${mc.length} correct.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
