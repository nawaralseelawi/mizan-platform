import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { CredentialsSchema } from "@shared/types";
import {
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "../auth";
import { db, schema } from "../db";
import { adminProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.session),

  login: publicProcedure
    .input(CredentialsSchema)
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email.toLowerCase()))
        .limit(1);
      const user = rows[0];
      // Constant-shape error: never reveal whether the email exists.
      const invalid = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
      if (!user || !user.isActive) throw invalid;
      const ok = await verifyPassword(input.password, user.passwordHash);
      if (!ok) throw invalid;

      await db
        .update(schema.users)
        .set({ lastSignedIn: new Date() })
        .where(eq(schema.users.id, user.id));

      const token = await createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      setSessionCookie(ctx.res, token);
      return { email: user.email, role: user.role, name: user.name };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    clearSessionCookie(ctx.res);
    return { success: true } as const;
  }),

  /**
   * Account creation is admin-only by design: platform accounts are for
   * maintainers of the national benchmark, not open registration.
   */
  createUser: adminProcedure
    .input(
      CredentialsSchema.extend({
        name: z.string().min(1).max(120),
        role: z.enum(["viewer", "maintainer", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const passwordHash = await hashPassword(input.password);
      try {
        const inserted = await db
          .insert(schema.users)
          .values({
            email: input.email.toLowerCase(),
            passwordHash,
            name: input.name,
            role: input.role,
          })
          .returning({
            id: schema.users.id,
            email: schema.users.email,
            role: schema.users.role,
          });
        return inserted[0];
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }
    }),
});

