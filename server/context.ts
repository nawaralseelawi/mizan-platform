import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { sessionFromRequest, type SessionPayload } from "./auth";

export interface Context {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  session: SessionPayload | null;
}

export async function createContext(
  opts: CreateExpressContextOptions,
): Promise<Context> {
  const session = await sessionFromRequest(opts.req);
  return { req: opts.req, res: opts.res, session };
}

