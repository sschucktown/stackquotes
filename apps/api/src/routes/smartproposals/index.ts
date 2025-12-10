import { Hono } from "hono";
import { commentsRouter } from "./comments.js";
import { signRouter } from "./sign.js";

export const smartProposalsRouter = new Hono();

// Proposal-specific comments (SmartProposal v2)
smartProposalsRouter.route("/:proposalId/comments", commentsRouter);

// Signature capture + job creation
smartProposalsRouter.route("/:proposalId/sign", signRouter);
