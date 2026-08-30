import { config } from "dotenv";

// Load environment variables from a local .env file automatically, so CLI
// tools and the server never require a manual shell loader step. This is a
// no-op when the variables are already set (e.g. in CI or production), and
// harmless when no .env file exists.
config();

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const ENV = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  sessionHours: Number(process.env.SESSION_HOURS ?? "72"),
  port: Number(process.env.PORT ?? "3000"),
  isProduction: process.env.NODE_ENV === "production",
} as const;

if (ENV.isProduction && ENV.jwtSecret === "change-me-in-production") {
  throw new Error("JWT_SECRET must be changed in production");
}
if (!Number.isFinite(ENV.sessionHours) || ENV.sessionHours <= 0) {
  throw new Error("SESSION_HOURS must be a positive number");
}

