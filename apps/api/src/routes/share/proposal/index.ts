import { Hono } from "hono";
import { proposalTokenRouter } from "./[token]/index.js";

export const proposalRouter = new Hono();

// /api/share/proposal/:token/...
proposalRouter.route("/:token", proposalTokenRouter);
