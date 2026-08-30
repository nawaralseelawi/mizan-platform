import { describe, it, expect } from "vitest";
import { scoreMultipleChoice } from "./score";

// Minimal MC item factory: correct_answer index 1 => letter "B".
const item = {
  question_format: "multiple_choice" as const,
  item_id: "T",
  track: "iraqi" as const,
  axis: "iraqi_knowledge" as const,
  prompt: "?",
  choices: ["x", "y", "z", "w"],
  correct_answer: 1,
};

describe("scoreMultipleChoice", () => {
  it("scores a bare correct letter", () => {
    expect(scoreMultipleChoice(item, "B")).toBe(1);
  });
  it("scores a bracketed letter", () => {
    expect(scoreMultipleChoice(item, "(B)")).toBe(1);
  });
  it("scores 'B) text'", () => {
    expect(scoreMultipleChoice(item, "B) the second option")).toBe(1);
  });
  it("picks the marked answer, not a stray earlier letter", () => {
    // 'A' appears in prose, but the real answer is B.
    expect(scoreMultipleChoice(item, "Also A is wrong. Answer: B")).toBe(1);
  });
  it("handles an Arabic lead-in", () => {
    expect(scoreMultipleChoice(item, "الجواب: B")).toBe(1);
  });
  it("scores a wrong letter as 0", () => {
    expect(scoreMultipleChoice(item, "C")).toBe(0);
  });
  it("scores empty output as 0", () => {
    expect(scoreMultipleChoice(item, "")).toBe(0);
  });
});
