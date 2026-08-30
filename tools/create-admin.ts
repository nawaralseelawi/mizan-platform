/**
 * CLI: bootstrap the first admin account.
 *
 * Usage:
 *   pnpm create:admin -- --email admin@example.iq --name "Admin" --password "..."
 */
import { parseArgs } from "node:util";
import { hashPassword } from "../server/auth";
import { closeDb, db, schema } from "../server/db";

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      password: { type: "string" },
    },
  });
  if (!values.email || !values.name || !values.password) {
    console.error(
      'Usage: pnpm create:admin -- --email <email> --name <name> --password <password>',
    );
    process.exit(2);
  }
  if (values.password.length < 10) {
    console.error("Password must be at least 10 characters.");
    process.exit(2);
  }

  const passwordHash = await hashPassword(values.password);
  await db.insert(schema.users).values({
    email: values.email.toLowerCase(),
    passwordHash,
    name: values.name,
    role: "admin",
  });
  console.log(`Admin account created for ${values.email}.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => closeDb());

