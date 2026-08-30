# Mizan Evaluation Runner

Offline evaluation runner for the Mizan benchmark. It takes an approved
JSONL item file, queries a model, auto-scores the deterministic formats
(multiple_choice, extraction), and emits a `mizan-results-v1` JSON file
that the platform imports.

This runner is intentionally standalone and provider-agnostic. It never
touches the platform database; the only contract between them is the
results JSON file. Open-generation items are excluded from auto-scoring
and flagged for human judging.

## Providers

Set the provider via `--provider` and the matching API key env var:

- `anthropic`  -> ANTHROPIC_API_KEY
- `openai`     -> OPENAI_API_KEY
- `openrouter` -> OPENROUTER_API_KEY  (one key routes to many models:
  GPT, Llama, Qwen, Gemma, Jais... use the full OpenRouter model id, e.g.
  `--model meta-llama/llama-3.1-70b-instruct`)
- `echo`       -> no key; a deterministic offline stub for pipeline testing

Add new providers by implementing one function in `providers.ts`.

## Usage

```
npm run eval -- \
  --items ../data/pilot-0.1-part1.jsonl \
  --items2 ../data/pilot-0.1-part2.jsonl \
  --provider anthropic \
  --model claude-sonnet-4-6 \
  --developer Anthropic \
  --version pilot-0.1 \
  --out ../data/results-claude.json
```

Then import into the platform:

```
npm run import:results -- --file data/results-claude.json
```

