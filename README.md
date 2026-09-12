# Mizan (ميزان) — Iraq's National LLM Benchmark for Iraqi Arabic

**Mizan** is the first comprehensive, originally-authored evaluation benchmark
for **Iraqi Arabic and the Iraqi civic context**: a Modern Standard Arabic (MSA)
baseline track paired with an Iraqi track across six axes — dialect
comprehension, dialect generation, bidirectional MSA–Iraqi translation,
Iraq-specific knowledge, official-document field extraction, and safety.

- 📄 **Paper (preprint):** https://doi.org/10.5281/zenodo.22714865 (arXiv version announced shortly)
- 🏆 **Live leaderboard:** https://mizan-bench.onrender.com
- 📊 **Public development set (Hugging Face):** see the dataset link on the leaderboard's About page
- ✍️ **Authors:** Nawar S. Alseelawi (University of Misan) & Mustafa S. Aljumaily (Missan Oil Company) — Members of the National Team for the Iraqi Large Language Model, Prime Minister's Office, Baghdad, Iraq

## What's in this repository

| Path | Contents |
|---|---|
| `client/` | Bilingual (Arabic-RTL / English) React frontend: leaderboard, per-axis tables, confidence intervals, analytical charts, verification page |
| `server/` | API + PostgreSQL persistence: items, runs, per-axis results, certificates, publication gate |
| `runner/` | Offline evaluation runner: uniform prompts, hardened retry ladder (2048→8192), per-item detail sidecars, OpenAI-compatible self-hosted path |
| `tools/` | Import/publish tooling, batch evaluation scripts, diagnostics (refusal probe, verification round) |
| `data/` | The pilot-0.2 public development bank (340 items) and per-run result/detail files |

## The integrity protocol

Every published number is a dated, immutable snapshot with a SHA-256
verification certificate, behind an explicit human publication gate. Retraction
is public and preserved. The full board was re-verified end-to-end under the
hardened harness, with run-to-run agreement reported in the paper.

## Quickstart (evaluate a model)

```bash
npm install
# configure .env: DATABASE_URL, plus OPENROUTER_API_KEY / ANTHROPIC_API_KEY,
# or OPENAI_BASE_URL for any OpenAI-compatible self-hosted endpoint (e.g. Ollama)
npx tsx runner/run.ts \
  --items data/pilot-0.2-all.jsonl \
  --provider openrouter --model <model-id> \
  --developer "<Developer>" --version pilot-0.2 \
  --out data/results-mymodel.json --details data/details-mymodel.json
npx tsx tools/import-results.ts --file data/results-mymodel.json
# publishing to the official leaderboard passes through a human-verified gate
```

## Citation

```bibtex
@misc{alseelawi2026mizan,
  author = {Alseelawi, Nawar S. and Aljumaily, Mustafa S.},
  title  = {Mizan: A National Benchmark for Evaluating Large Language Models
            on Iraqi Arabic and the Iraqi Civic Context},
  year   = {2026},
  doi    = {10.5281/zenodo.22714865}
}
```

## License

Code is released under the **Apache License 2.0** (see `LICENSE`).
The public development set is released under **CC BY 4.0** on Hugging Face.
