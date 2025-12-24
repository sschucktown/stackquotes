import { Hono } from "hono";
import { proposalRouter } from "./proposal/index.js";

const shareRouter = new Hono();

shareRouter.route("/proposal", proposalRouter);

export default shareRouter;
