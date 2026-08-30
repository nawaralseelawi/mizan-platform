import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../drizzle/schema";
import { ENV } from "./env";

const pool = new pg.Pool({
  connectionString: ENV.databaseUrl,
  max: 10,
});

export const db = drizzle(pool, { schema });
export { schema };

export async function closeDb(): Promise<void> {
  await pool.end();
}

