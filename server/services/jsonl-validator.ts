/**
 * Validates a Sumer JSONL export line by line against the shared item schema.
 * Returns parsed items plus a full error report; import is all-or-nothing
 * at the caller's discretion.
 */
import { createHash } from "node:crypto";
import { parseBenchmarkItem, type BenchmarkItem } from "@shared/types";

export interface ValidatedLine {
  lineNumber: number;
  item: BenchmarkItem;
  /** SHA-256 hex digest of the exact raw line (canonical provenance hash). */
  contentHash: string;
}

export interface ValidationReport {
  valid: ValidatedLine[];
  errors: { lineNumber: number; messages: string[] }[];
  duplicateItemIds: string[];
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function validateJsonl(content: string): ValidationReport {
  const valid: ValidatedLine[] = [];
  const errors: ValidationReport["errors"] = [];
  const seenIds = new Map<string, number>();
  const duplicateItemIds: string[] = [];

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw === undefined || raw.trim().length === 0) continue;
    const lineNumber = i + 1;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      errors.push({
        lineNumber,
        messages: [`invalid JSON: ${(e as Error).message}`],
      });
      continue;
    }

    const result = parseBenchmarkItem(parsed);
    if (!result.ok) {
      errors.push({ lineNumber, messages: result.errors });
      continue;
    }

    const id = result.item.item_id;
    const firstSeen = seenIds.get(id);
    if (firstSeen !== undefined) {
      errors.push({
        lineNumber,
        messages: [`duplicate item_id "${id}" (first seen on line ${firstSeen})`],
      });
      if (!duplicateItemIds.includes(id)) duplicateItemIds.push(id);
      continue;
    }
    seenIds.set(id, lineNumber);

    valid.push({ lineNumber, item: result.item, contentHash: sha256Hex(raw) });
  }

  return { valid, errors, duplicateItemIds };
}

