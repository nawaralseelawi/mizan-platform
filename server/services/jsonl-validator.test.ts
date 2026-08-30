import { describe, expect, it } from "vitest";
import { validateJsonl } from "./jsonl-validator";

const validMc = JSON.stringify({
  item_id: "TST-0001",
  track: "iraqi",
  axis: "comprehension",
  question_format: "multiple_choice",
  difficulty: "easy",
  dialect_region: "baghdadi",
  contamination_tier: "public_dev",
  prompt: "placeholder prompt",
  choices: ["a", "b", "c"],
  correct_answer: 1,
});

describe("validateJsonl", () => {
  it("accepts a valid multiple-choice line", () => {
    const report = validateJsonl(validMc);
    expect(report.errors).toHaveLength(0);
    expect(report.valid).toHaveLength(1);
    expect(report.valid[0]?.item.item_id).toBe("TST-0001");
    expect(report.valid[0]?.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects correct_answer index out of range", () => {
    const bad = JSON.parse(validMc) as Record<string, unknown>;
    bad.correct_answer = 5;
    const report = validateJsonl(JSON.stringify(bad));
    expect(report.valid).toHaveLength(0);
    expect(report.errors[0]?.messages.join(" ")).toContain("out of range");
  });

  it("rejects invalid JSON with line number", () => {
    const report = validateJsonl(`${validMc}\n{not json}`);
    expect(report.valid).toHaveLength(1);
    expect(report.errors[0]?.lineNumber).toBe(2);
  });

  it("rejects duplicate item_id", () => {
    const report = validateJsonl(`${validMc}\n${validMc}`);
    expect(report.valid).toHaveLength(1);
    expect(report.duplicateItemIds).toContain("TST-0001");
  });

  it("requires ground_truth for extraction items", () => {
    const extraction = {
      item_id: "TST-0002",
      track: "iraqi",
      axis: "official_documents",
      question_format: "extraction",
      difficulty: "medium",
      dialect_region: "msa",
      contamination_tier: "public_dev",
      prompt: "placeholder",
      ground_truth: {},
    };
    const report = validateJsonl(JSON.stringify(extraction));
    expect(report.valid).toHaveLength(0);
  });

  it("requires rubric_id for open_generation items", () => {
    const gen = {
      item_id: "TST-0003",
      track: "iraqi",
      axis: "generation",
      question_format: "open_generation",
      difficulty: "hard",
      dialect_region: "southern",
      contamination_tier: "public_dev",
      prompt: "placeholder",
    };
    const report = validateJsonl(JSON.stringify(gen));
    expect(report.valid).toHaveLength(0);
    expect(report.errors[0]?.messages.join(" ")).toContain("rubric_id");
  });

  it("skips blank lines without error", () => {
    const report = validateJsonl(`\n${validMc}\n\n`);
    expect(report.valid).toHaveLength(1);
    expect(report.errors).toHaveLength(0);
  });
});

