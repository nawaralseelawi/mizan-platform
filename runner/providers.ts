/**
 * Model providers for the evaluation runner. Each provider takes a prompt
 * and returns raw text. Keep this file dependency-light: only fetch.
 *
 * Empty-response hardening (uniform across all network providers):
 * reasoning-heavy models occasionally burn the whole completion budget on
 * internal deliberation and return empty content, and gateways sometimes
 * return transient errors. Every call therefore runs under the same retry
 * ladder: attempt 1 at the base budget (2048), then up to two retries at
 * an escalated budget (8192) with backoff. Recoveries are printed so the
 * console log remains a complete audit trail. Only after the full ladder
 * fails does the call throw (the runner then logs `!` and scores zero).
 * The ladder is an infrastructure parameter applied identically to every
 * model - documented in the paper's experimental setup.
 */
export type ProviderName = "anthropic" | "openai" | "openrouter" | "echo";

export interface CallOptions {
  model: string;
  prompt: string;
  system?: string;
  maxTokens?: number;
}

const BASE_MAX_TOKENS = 2048;
const RETRY_MAX_TOKENS = 8192;
const RETRY_DELAYS_MS = [0, 1500, 4000];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Runs `attempt` under the uniform retry ladder. Returns the first
 * non-empty text; throws after all attempts stay empty or fail.
 */
async function withRetryLadder(
  label: string,
  attempt: (maxTokens: number) => Promise<string>,
): Promise<string> {
  const budgets = [BASE_MAX_TOKENS, RETRY_MAX_TOKENS, RETRY_MAX_TOKENS];
  let lastFailure = "empty content";
  for (let i = 0; i < budgets.length; i += 1) {
    const delay = RETRY_DELAYS_MS[i] ?? 0;
    if (delay > 0) await sleep(delay);
    const budget = budgets[i] ?? RETRY_MAX_TOKENS;
    try {
      const text = await attempt(budget);
      if (text.trim().length > 0) {
        if (i > 0) {
          console.log(
            `    (recovered on retry ${i} at ${budget} tokens: ${label})`,
          );
        }
        return text;
      }
      lastFailure = "empty content";
    } catch (e) {
      lastFailure = e instanceof Error ? e.message : String(e);
    }
    if (i < budgets.length - 1) {
      console.log(`    (retrying ${label}: ${lastFailure})`);
    }
  }
  throw new Error(`no content after ${budgets.length} attempts (${lastFailure})`);
}

async function anthropicOnce(
  opts: CallOptions,
  maxTokens: number,
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: maxTokens,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    content: { type: string; text?: string }[];
  };
  return data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");
}

async function callAnthropic(opts: CallOptions): Promise<string> {
  return withRetryLadder(`anthropic/${opts.model}`, (maxTokens) =>
    anthropicOnce(opts, maxTokens),
  );
}

async function openAICompatibleOnce(
  url: string,
  headers: Record<string, string>,
  errorLabel: string,
  opts: CallOptions,
  maxTokens: number,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: maxTokens,
      messages: [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: opts.prompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`${errorLabel} API error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  // Some models occasionally return an error object or an empty choices
  // array (rate limit, content filter, or a malformed reply) with HTTP 200.
  if (data.error) {
    throw new Error(`${errorLabel} model error: ${data.error.message ?? "unknown"}`);
  }
  return data.choices?.[0]?.message?.content ?? "";
}

async function callOpenAI(opts: CallOptions): Promise<string> {
  // OPENAI_BASE_URL enables any OpenAI-compatible endpoint (vLLM, Ollama,
  // LM Studio, self-hosted gateways). Local servers rarely check the key,
  // so a placeholder is used when only a custom base URL is configured.
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  const key = process.env.OPENAI_API_KEY ?? (process.env.OPENAI_BASE_URL ? "local-no-key" : undefined);
  if (!key) throw new Error("OPENAI_API_KEY is not set (or set OPENAI_BASE_URL for a local endpoint)");
  return withRetryLadder(`openai/${opts.model}`, (maxTokens) =>
    openAICompatibleOnce(
      `${baseUrl}/chat/completions`,
      { authorization: `Bearer ${key}` },
      "OpenAI",
      opts,
      maxTokens,
    ),
  );
}

/**
 * OpenRouter: a single API key that routes to dozens of models via an
 * OpenAI-compatible endpoint. The model string is the full OpenRouter id.
 */
async function callOpenRouter(opts: CallOptions): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return withRetryLadder(`openrouter/${opts.model}`, (maxTokens) =>
    openAICompatibleOnce(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        authorization: `Bearer ${key}`,
        // Optional attribution headers OpenRouter recommends.
        "HTTP-Referer": "https://github.com/nawaralseelawi/mizan-platform",
        "X-Title": "Mizan (IraqLLM-Bench)",
      },
      "OpenRouter",
      opts,
      maxTokens,
    ),
  );
}

/**
 * Deterministic offline stub. Answers MC by returning the FIRST choice
 * letter and echoes a fixed extraction shape. Used to exercise the full
 * pipeline without network or keys - never for real scoring.
 */
function callEcho(opts: CallOptions): string {
  if (opts.prompt.includes("Answer with the letter")) return "A";
  return "{}";
}

export async function callModel(
  provider: ProviderName,
  opts: CallOptions,
): Promise<string> {
  switch (provider) {
    case "anthropic":
      return callAnthropic(opts);
    case "openai":
      return callOpenAI(opts);
    case "openrouter":
      return callOpenRouter(opts);
    case "echo":
      return callEcho(opts);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
