import { Hono } from "hono";
import { proposalRouter } from "./proposal/index.js";

export const shareRouter = new Hono();

// /api/share/proposal/...
shareRouter.route("/proposal", proposalRouter);
