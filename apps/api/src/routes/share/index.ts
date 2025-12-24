import { Hono } from "hono";
import proposalRouter from "./proposal";

const shareRouter = new Hono();

shareRouter.route("/proposal", proposalRouter);

export default shareRouter;
