import { router } from "../trpc";
import { authRouter } from "./auth";
import { benchmarkRouter } from "./benchmark";
import { leaderboardRouter } from "./leaderboard";
import { modelsRouter } from "./models";
import { adminRouter } from "./admin";
import { certificatesRouter } from "./certificates";

export const appRouter = router({
  auth: authRouter,
  benchmark: benchmarkRouter,
  leaderboard: leaderboardRouter,
  models: modelsRouter,
  admin: adminRouter,
  certificates: certificatesRouter,
});

export type AppRouter = typeof appRouter;

