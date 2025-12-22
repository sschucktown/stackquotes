import { Hono } from "hono";
import { sharedProposalRouter } from "./proposal";

export const shareRouter = new Hono();

// /api/share/proposal/:token/...
shareRouter.route("/proposal/:token", sharedProposalRouter);
