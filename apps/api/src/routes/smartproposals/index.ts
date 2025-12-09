import { Hono } from "hono";
import { commentsRouter } from "./comments.ts";
import { signRouter } from "./sign.ts";

export const smartProposalsRouter = new Hono();

// Comments scoped to a specific proposal
smartProposalsRouter.route("/:proposalId/comments", commentsRouter);

// Signature endpoint (global, uses public_token)
smartProposalsRouter.route("/sign", signRouter);
