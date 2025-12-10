import { createApp } from "./app.js";
import { jobsRouter } from "./routes/jobs/index.js";

const app = createApp();

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

export default app.fetch;
export type AppType = typeof app;
export { createApp } from "./app.js";
