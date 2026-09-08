/**
 * Mizan evaluation runner entry point.
 *
 * Reads one or more JSONL item files, queries a model provider, scores the
 * deterministic formats per (track, axis), and writes a mizan-results-v1
 * JSON file for the platform to import.
 *
 * Optional --details <path>: additionally writes a per-item sidecar JSON
 * (item, raw model response, score) for auto-scored items. This enables
 * error analysis and grader audits. The sidecar is diagnostic material -
 * it is never imported into the platform.
 */
import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { config } from "dotenv";
// Auto-load .env so the runner picks up ANTHROPIC_API_KEY / OPENAI_API_KEY
// without a manual shell loader step.
config();
import {
  parseBenchmarkItem,
  type Axis,
  type BenchmarkItem,
  type Track,
} from "@shared/types";
import { callModel, type ProviderName } from "./providers";
import {
  buildPrompt,
  scoreExtraction,
  scoreMultipleChoice,
} from "./score";

interface Bucket {
  scores: number[];
  autoScored: number;
  humanPending: number;
}

interface DetailRecord {
  item: BenchmarkItem;
  raw_response: string;
  score: number;
}

function keyOf(track: Track, axis: Axis): string {
  return `${track}::${axis}`;
}

async function loadItems(paths: string[]): Promise<BenchmarkItem[]> {
  const items: BenchmarkItem[] = [];
  for (const path of paths) {
    const content = await readFile(path, "utf8");
    for (const [i, line] of content.split(/\r?\n/).entries()) {
      if (line.trim().length === 0) continue;
      const parsed = parseBenchmarkItem(JSON.parse(line));
      if (!parsed.ok) {
        throw new Error(
          `Invalid item in ${path} line ${i + 1}: ${parsed.errors.join("; ")}`,
        );
      }
      items.push(parsed.item);
    }
  }
  return items;
}

function gitCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "0000000000000000000000000000000000000000";
  }
}

/** Wilson-adjusted normal approximation for a proportion 95% CI. */
function confidenceInterval(
  scores: number[],
): { low: number; high: number } | null {
  const n = scores.length;
  if (n === 0) return null;
  const p = scores.reduce((a, b) => a + b, 0) / n;
  const z = 1.96;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const margin =
    (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return {
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
  };
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      items: { type: "string" },
      items2: { type: "string" },
      provider: { type: "string" },
      model: { type: "string" },
      developer: { type: "string" },
      version: { type: "string" },
      out: { type: "string" },
      parameters: { type: "string" },
      license: { type: "string" },
      details: { type: "string" },
    },
  });

  const required = ["items", "provider", "model", "developer", "version", "out"];
  for (const r of required) {
    if (!values[r as keyof typeof values]) {
      console.error(`Missing --${r}`);
      process.exit(2);
    }
  }

  const paths = [values.items!, values.items2].filter(
    (p): p is string => Boolean(p),
  );
  const items = await loadItems(paths);
  const provider = values.provider as ProviderName;

  const buckets = new Map<string, Bucket>();
  const getBucket = (track: Track, axis: Axis): Bucket => {
    const k = keyOf(track, axis);
    let b = buckets.get(k);
    if (!b) {
      b = { scores: [], autoScored: 0, humanPending: 0 };
      buckets.set(k, b);
    }
    return b;
  };

  const details: DetailRecord[] = [];

  console.log(
    `Evaluating ${items.length} items with ${provider}/${values.model}...`,
  );

  let done = 0;
  for (const item of items) {
    const bucket = getBucket(item.track, item.axis);
    if (item.question_format === "open_generation") {
      bucket.humanPending++;
      continue;
    }
    const { system, prompt } = buildPrompt(item);
    let raw = "";
    try {
      raw = await callModel(provider, { model: values.model!, prompt, system });
    } catch (e) {
      console.error(`  ! ${item.item_id}: ${(e as Error).message}`);
      raw = "";
    }
    const score =
      item.question_format === "multiple_choice"
        ? scoreMultipleChoice(item, raw)
        : scoreExtraction(item, raw);
    bucket.scores.push(score);
    bucket.autoScored++;
    if (values.details) {
      details.push({ item, raw_response: raw, score });
    }
    done++;
    if (done % 5 === 0) console.log(`  ...${done} scored`);
  }

  const results = [...buckets.entries()]
    .filter(([, b]) => b.scores.length > 0)
    .map(([k, b]) => {
      const [track, axis] = k.split("::") as [Track, Axis];
      const score = b.scores.reduce((a, c) => a + c, 0) / b.scores.length;
      const ci = confidenceInterval(b.scores);
      return {
        track,
        axis,
        score,
        ci_low: ci?.low,
        ci_high: ci?.high,
        n_items: b.scores.length,
        tier: "public_dev" as const,
      };
    });

  const humanPending = [...buckets.values()].reduce(
    (a, b) => a + b.humanPending,
    0,
  );

  const output = {
    schema_version: "mizan-results-v1" as const,
    model: {
      name: values.model!,
      developer: values.developer!,
      parameters: values.parameters,
      license: values.license,
      source: `${provider} API`,
    },
    benchmark_version: values.version!,
    run: {
      completed_at: new Date().toISOString(),
      harness_commit: gitCommit(),
      config: {
        provider,
        auto_scored_only: true,
        human_pending_items: humanPending,
        note: "Mizan runner - deterministic formats auto-scored; open_generation pending human judging",
      },
    },
    results,
  };

  await writeFile(values.out!, JSON.stringify(output, null, 2), "utf8");
  console.log(
    `\nDone. ${results.length} (track, axis) scores written to ${values.out}`,
  );
  if (values.details) {
    await writeFile(
      values.details,
      JSON.stringify(
        {
          schema_version: "mizan-details-v1",
          model: values.model!,
          benchmark_version: values.version!,
          completed_at: new Date().toISOString(),
          records: details,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(
      `Per-item details (${details.length} records) written to ${values.details}`,
    );
  }
  if (humanPending > 0) {
    console.log(
      `${humanPending} open-generation item(s) skipped - they require human judging.`,
    );
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
