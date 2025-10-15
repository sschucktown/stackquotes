import { Hono } from "hono";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { estimatesRouter } from "./routes/estimates.js";
import { clientsRouter } from "./routes/clients.js";
import { pdfRouter } from "./routes/pdf.js";
import { emailRouter } from "./routes/email.js";
import { settingsRouter } from "./routes/settings.js";
import { shareRouter } from "./routes/share.js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

const loadEnvironment = () => {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const moduleUrl = import.meta.url;
  const __filename = fileURLToPath(moduleUrl);
  const __dirname = dirname(__filename);
  const envPath = resolve(__dirname, "../../../.env");

  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log("[api] Loaded .env from", envPath);
  } else {
    console.warn("[api] .env not found at", envPath);
  }
};

let isEnvLoaded = false;

export const createApp = () => {
  if (!isEnvLoaded) {
    loadEnvironment();
    isEnvLoaded = true;
  }

  console.log("[api] SUPABASE_URL:", process.env.SUPABASE_URL ?? "(undefined)");

  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use("*", async (c, next) => {
    try {
      await next();
    } catch (error) {
      console.error(error);
      if (error instanceof HTTPException) {
        return c.json({ error: error.message }, error.status);
      }
      return c.json({ error: (error as Error).message ?? "Unexpected error" }, 500);
    }
  });

  const healthHandler = (c: Context) => c.json({ ok: true });
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);
  app.route("/api/estimates", estimatesRouter);
    app.route("/estimates", estimatesRouter);
  app.route("/api/clients", clientsRouter);
    app.route("/clients", clientsRouter);
  app.route("/api/pdf", pdfRouter);
    app.route("/pdf", pdfRouter);
  app.route("/api/email", emailRouter);
    app.route("/email", emailRouter);
  app.route("/api/settings", settingsRouter);
    app.route("/settings", settingsRouter);
  app.route("/api/share", shareRouter);
    app.route("/share", shareRouter);

  return app;
};

export type AppType = ReturnType<typeof createApp>;
