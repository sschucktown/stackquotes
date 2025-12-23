import { Hono } from "hono";
import { signRouter } from "./sign.js";
import { jobRouter } from "./job.js";

export const proposalTokenRouter = new Hono();

// POST /api/share/proposal/:token/sign
proposalTokenRouter.route("/sign", signRouter);

// GET /api/share/proposal/:token/job
proposalTokenRouter.route("/job", jobRouter);
