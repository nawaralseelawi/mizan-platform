/**
 * Fully self-hosted authentication. No third-party identity provider.
 * Password hashing: bcrypt (cost 12). Sessions: signed JWT in an
 * httpOnly, sameSite=strict cookie.
 */
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@shared/types";
import { ENV } from "./env";

export const SESSION_COOKIE = "mizan_session";
const BCRYPT_COST = 12;
const secretKey = new TextEncoder().encode(ENV.jwtSecret);

export interface SessionPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ENV.sessionHours}h`)
    .sign(secretKey);
}

export async function readSessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const { userId, email, role } = payload as Record<string, unknown>;
    if (
      typeof userId !== "number" ||
      typeof email !== "string" ||
      (role !== "viewer" && role !== "maintainer" && role !== "admin")
    ) {
      return null;
    }
    return { userId, email, role };
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: "strict",
    maxAge: ENV.sessionHours * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function sessionFromRequest(
  req: Request,
): Promise<SessionPayload | null> {
  const token = (req.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];
  if (!token) return null;
  return readSessionToken(token);
}

