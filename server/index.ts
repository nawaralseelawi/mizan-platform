import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { createContext } from "./context";
import { ENV } from "./env";
import { appRouter } from "./routers/index";

const app = express();
app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext }),
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "mizan-platform" });
});

if (ENV.isProduction) {
  // Resolve the built client. A built client always ships an `assets`
  // folder next to index.html; the raw source does not. Requiring it
  // prevents serving TypeScript sources with the wrong MIME type.
  const candidates = [
    path.resolve(import.meta.dirname, "../client"),
    path.resolve(import.meta.dirname, "../dist/client"),
  ];
  const clientDir = candidates.find(
    (dir) =>
      fs.existsSync(path.join(dir, "index.html")) &&
      fs.existsSync(path.join(dir, "assets")),
  );
  if (!clientDir) {
    throw new Error(
      "Built client not found. Run `npm run build` before starting in production mode.",
    );
  }
  app.use(express.static(clientDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.listen(ENV.port, () => {
  console.log(`[mizan] listening on http://localhost:${ENV.port}`);
});

