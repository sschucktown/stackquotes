import { Hono } from "hono";

// Sub-routers
import { commentsRouter } from "./comments.ts";
import { signRouter } from "./sign.ts";

/**
 * Root router for SmartProposals module
 *
 * /api/smartproposals/:proposalId/comments
 * /api/smartproposals/:proposalId/sign
 */
export const smartProposalsRouter = new Hono();

/**
 * Proposal Comments
 * ------------------
 * POST, GET messages tied to a proposal
 */
smartProposalsRouter.route("/:proposalId/comments", commentsRouter);

/**
 * Proposal Signature
 * ------------------
 * Handles capturing a signature image + storing final accepted option
 *
 * POST /api/smartproposals/:proposalId/sign
 */
smartProposalsRouter.route("/:proposalId/sign", signRouter);

/**
 * Default route safety — optional but useful for debugging
 */
smartProposalsRouter.get("/", (c) =>
  c.json({
    ok: true,
    message: "SmartProposals API root reachable",
    routes: [
      "/:proposalId/comments",
      "/:proposalId/sign",
    ],
  })
);
