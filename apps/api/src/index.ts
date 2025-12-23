import { createApp } from "./app.js";
import { handle } from "hono/vercel";

const app = createApp();

/**
 * Local dev (Node)
 */
if (!process.env.VERCEL) {
  import("@hono/node-server").then(({ serve }) => {
    const port = Number(process.env.PORT ?? 8787);
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(`[api] StackQuotes API running on http://localhost:${port}`);
  });
}

/**
 * Vercel entrypoint
 * ⚠️ THIS is what fixes the 404s
 */
export default handle(app);

export type AppType = typeof app;
export { createApp } from "./app.js";
