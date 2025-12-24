import { Hono } from "hono";

// TypeScript cannot resolve .js extensions during dev,
// but Vercel WILL resolve them at runtime.
// These suppress TS-only errors safely.

// @ts-ignore
import { jobRouter } from "./[token]/job.js";
// @ts-ignore
import { signRouter } from "./[token]/sign.js";

export const proposalRouter = new Hono();

/**
 * 🔍 ROUTE PROBE
 * This confirms routing is working
 */
proposalRouter.get("/:token", (c) => {
  return c.json({
    ok: true,
    token: c.req.param("token"),
  });
});

/**
 * Nested routes
 */
proposalRouter.route("/:token/job", jobRouter);
proposalRouter.route("/:token/sign", signRouter);
