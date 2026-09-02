# Mizan (IraqLLM-Bench) — Model Evaluation Runner Guide

This guide explains how to evaluate a language model on the Mizan benchmark
and submit the results for publication on the official leaderboard
(https://mizan-bench.onrender.com). Mizan is an evaluation harness and
results registry: it never hosts model weights and runs no inference on its
servers. You run the evaluation on your own machine or API keys; Mizan
verifies and publishes the results.

---

## 1. Prerequisites

- **Node.js 20+** (https://nodejs.org, LTS) and **git**
- Access to the `mizan-platform` repository (public at paper release;
  before that, request access via **mizan.iraqllm@gmail.com**)
- One of:
  - an **API key** for a cloud provider (OpenRouter, OpenAI, or Anthropic), or
  - a **self-hosted model** served through an OpenAI-compatible endpoint
    (vLLM, Ollama, LM Studio, or any compatible gateway)

## 2. Setup

```bash
git clone https://github.com/nawaralseelawi/mizan-platform.git
cd mizan-platform
npm install
```

The evaluation items live in `data/pilot-0.2-all.jsonl`
(340 items: 190 auto-scorable, 150 open-generation items reserved for
human judging — the runner skips those automatically and reports them
as pending).

## 3. Path A — Evaluate an API-hosted model

Set the provider key in your environment, then run:

```bash
# OpenRouter (most models)
set OPENROUTER_API_KEY=sk-or-...        # PowerShell: $env:OPENROUTER_API_KEY="sk-or-..."
npx tsx runner/run.ts --items data/pilot-0.2-all.jsonl --provider openrouter --model "vendor/model-slug" --developer "Vendor" --version pilot-0.2 --out data/results-mymodel.json
```

For Anthropic or OpenAI models use `--provider anthropic` / `--provider openai`
with the matching `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`.

## 4. Path B — Evaluate a self-hosted model (no size limit)

Serve your model with any OpenAI-compatible server, e.g.:

```bash
# Ollama example
ollama serve                       # exposes http://localhost:11434/v1
ollama pull your-model

# vLLM example
python -m vllm.entrypoints.openai.api_server --model /path/to/model --port 8000
```

Point the runner at your endpoint via `OPENAI_BASE_URL`:

```bash
# PowerShell
$env:OPENAI_BASE_URL="http://localhost:11434/v1"
npx tsx runner/run.ts --items data/pilot-0.2-all.jsonl --provider openai --model "your-model-name" --developer "Your Lab" --version pilot-0.2 --out data/results-mymodel.json
```

Notes:
- `OPENAI_API_KEY` is optional for local endpoints (a placeholder is sent).
- Any parameter count works — 13B, 70B, or beyond — since inference runs
  entirely on your hardware.

## 5. What the runner produces

- Per-item responses and automatic scores for the 190 auto-scorable items
  (multiple-choice accuracy and official-document field extraction).
- A results JSON containing per-(track, axis) aggregate scores and a
  **SHA-256 verification hash** covering the raw outputs.
- A console summary noting the 150 open-generation items pending human
  judging (evaluated separately by the Mizan judging protocol).

## 6. Submitting results for the official leaderboard

1. Email **mizan.iraqllm@gmail.com** with:
   - the results JSON file,
   - model name, version/date, developer, parameter count, and
     hosting details (API provider or self-hosted setup),
   - your name and affiliation.
2. The Mizan team re-runs an audit sample against the same model and
   matches verification hashes.
3. On success, the result is published as a **dated, immutable snapshot**
   with its verification certificate. New model versions are published as
   new runs; history is never overwritten.

## 7. Reproducing the published leaderboard

Every published run's certificate hash is shown on the platform. To verify
a published number, run the same model with the same bank version and
compare aggregate scores; contact the team for the audit protocol.

---

Questions or access requests: **mizan.iraqllm@gmail.com**
Mizan — the first national LLM evaluation framework for Modern Standard
Arabic and Iraqi Arabic.
