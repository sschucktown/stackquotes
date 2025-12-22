import { Hono } from "hono";
import { signRouter } from "./sign";
import { jobRouter } from "./job";

export const sharedProposalRouter = new Hono();

sharedProposalRouter.route("/sign", signRouter);
sharedProposalRouter.route("/job", jobRouter);
