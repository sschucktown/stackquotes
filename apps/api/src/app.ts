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
import { proposalsRouter } from "./routes/proposals.js";
import { contractorRouter } from "./routes/contractor.js";
import { stripeRouter } from "./routes/stripe/index.js";
import { wisetackRouter } from "./routes/wisetack/index.js";
import { addonsRouter } from "./routes/addons.js";

import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

// ----------------------------
// Environment loader (dev only)
// ----------------------------
const loadEnvironment = () => {
  if (process.env.NODE_ENV === "production") return;

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

// ----------------------------
// App factory
// ----------------------------
export const createApp = () => {
  if (!isEnvLoaded) {
    loadEnvironment();
    isEnvLoaded = true;
  }

  console.log("[api] SUPABASE_URL:", process.env.SUPABASE_URL ?? "(undefined)");

  const app = new Hono();

  // Global CORS
  app.use(
    "*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Global error handler
  app.use("*", async (c, next) => {
    try {
      await next();
    } catch (error) {
      console.error(error);
      if (error instanceof HTTPException) {
        return c.json({ error: error.message }, error.status);
      }
      return c.json(
        { error: (error as Error).message ?? "Unexpected error" },
        500
      );
    }
  });

  // Health check
  const healthHandler = (c: Context) => c.json({ ok: true });
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  // ----------------------------
  // Route mounts (all under /api)
  // ----------------------------
  app.route("/api/estimates", estimatesRouter);
  app.route("/api/clients", clientsRouter);
  app.route("/api/pdf", pdfRouter);
  app.route("/api/email", emailRouter);
  app.route("/api/settings", settingsRouter);
  app.route("/api/share", shareRouter);
  app.route("/api/proposals", proposalsRouter);
  app.route("/api/contractor", contractorRouter);
  app.route("/api/stripe", stripeRouter);
  app.route("/api/addons", addonsRouter);
  app.route("/api/wisetack", wisetackRouter);

  return app;
};

export type AppType = ReturnType<typeof createApp>;
