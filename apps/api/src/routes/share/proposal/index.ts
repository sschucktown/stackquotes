import { Hono } from "hono";
import { signRouter } from "../sign";
import { jobRouter } from "../../../job";

export const sharedProposalRouter = new Hono();

// POST /api/share/proposal/:token/sign
sharedProposalRouter.route("/sign", signRouter);

// GET /api/share/proposal/:token/job
sharedProposalRouter.route("/job", jobRouter);
