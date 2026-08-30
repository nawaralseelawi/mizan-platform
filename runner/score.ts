/**
 * Scoring logic for deterministic item formats. Open-generation items are
 * not scored here - they are collected for human judging.
 */
import type { BenchmarkItem } from "@shared/types";

const LETTERS = ["A", "B", "C", "D", "E"];

export function buildPrompt(item: BenchmarkItem): {
  system: string;
  prompt: string;
} {
  if (item.question_format === "multiple_choice") {
    const lines = item.choices.map((c, i) => `${LETTERS[i]}) ${c}`);
    return {
      system:
        "You are taking a multiple-choice exam in Arabic. Answer with the letter of the correct option only.",
      prompt: `${item.prompt}\n\n${lines.join("\n")}\n\nAnswer with the letter only (A, B, C, ...).`,
    };
  }
  if (item.question_format === "extraction") {
    const fields = Object.keys(item.ground_truth);
    return {
      system:
        "Extract the requested fields from the Arabic document. Reply with a compact JSON object only, no commentary.",
      prompt: `${item.context ?? ""}\n\n${item.prompt}\n\nReturn JSON with exactly these keys: ${fields.join(", ")}.`,
    };
  }
  // open_generation - collected, not auto-scored
  return { system: "", prompt: item.prompt };
}

export function scoreMultipleChoice(
  item: Extract<BenchmarkItem, { question_format: "multiple_choice" }>,
  raw: string,
): 0 | 1 {
  const cleaned = raw.trim().toUpperCase();
  if (cleaned.length === 0) return 0;

  // Prefer a clearly-marked answer letter over the first stray A-E in prose
  // (strong models sometimes explain before answering). Try, in order:
  //   1. a letter standing alone as a token: "B", "B)", "(B)", "B."
  //   2. a letter right after an "answer:" style lead-in
  //   3. fall back to the first A-E character anywhere
  const patterns = [
    /(?:ANSWER|CORRECT|OPTION|الجواب|الإجابة)\D{0,6}([A-E])/, // after a lead-in
    /(?:^|\s|\()([A-E])(?:\)|\.|:|\s|$)/, // standalone / bracketed letter
  ];
  let letter: string | undefined;
  for (const p of patterns) {
    const m = cleaned.match(p);
    if (m) {
      letter = m[1];
      break;
    }
  }
  if (!letter) {
    const m = cleaned.match(/[A-E]/);
    if (!m) return 0;
    letter = m[0];
  }
  const chosen = LETTERS.indexOf(letter);
  return chosen === item.correct_answer ? 1 : 0;
}

function normalize(s: string): string {
  return s
    .trim()
    .replace(/[\u064B-\u0652]/g, "") // strip Arabic diacritics
    .replace(/\s+/g, " ")
    .replace(/[.,،؛]/g, "");
}

/** Field-level exact match, averaged over ground-truth fields. */
export function scoreExtraction(
  item: Extract<BenchmarkItem, { question_format: "extraction" }>,
  raw: string,
): number {
  let parsed: Record<string, unknown> = {};
  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    }
  } catch {
    return 0;
  }
  const fields = Object.entries(item.ground_truth);
  if (fields.length === 0) return 0;
  let correct = 0;
  for (const [key, expected] of fields) {
    const got = parsed[key];
    if (typeof got === "string" && normalize(got) === normalize(expected)) {
      correct++;
    }
  }
  return correct / fields.length;
}

