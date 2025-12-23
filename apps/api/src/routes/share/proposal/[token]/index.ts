import { Hono } from "hono";
import { jobRouter } from "./job.js";
import { signRouter } from "./sign.js";

export const proposalTokenRouter = new Hono();

proposalTokenRouter.route("/job", jobRouter);
proposalTokenRouter.route("/sign", signRouter);
