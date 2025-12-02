import { Hono } from "hono";
import { commentsRouter } from "./comments.js";

export const smartProposalsRouter = new Hono();

// Proposal-specific comments (SmartProposal v2)
smartProposalsRouter.route("/:proposalId/comments", commentsRouter);
