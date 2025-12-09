import { Hono } from "hono";
import { commentsRouter } from "./comments.ts";
import { signRouter } from "./sign.ts";

export const smartProposalsRouter = new Hono();

smartProposalsRouter.route("/:proposalId/comments", commentsRouter);
smartProposalsRouter.route("/:proposalId/sign", signRouter);
