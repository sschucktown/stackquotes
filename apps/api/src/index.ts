import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { estimatesRouter } from "./routes/estimates.js";
import { clientsRouter } from "./routes/clients.js";
import { pdfRouter } from "./routes/pdf.js";
import { emailRouter } from "./routes/email.js";
import { settingsRouter } from "./routes/settings.js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env") });

console.log("🧭 Looking for .env at:", envPath);
console.log("🧭 Exists?", existsSync(envPath));

const app = new Hono();
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

app.use("*", cors({
  origin: (origin) => origin ?? "*",
  allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

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

app.get("/health", (c) => c.json({ ok: true }));
app.route("/api/estimates", estimatesRouter);
app.route("/api/clients", clientsRouter);
app.route("/api/pdf", pdfRouter);
app.route("/api/email", emailRouter);
app.route("/api/settings", settingsRouter);

const port = Number(process.env.PORT ?? 8787);

serve({
  fetch: app.fetch,
  port,
});
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

console.log(`StackQuotes API running on http://localhost:${port}`);

export type AppType = typeof app;

