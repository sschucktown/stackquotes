import { Hono } from "hono";
import proposalTokenRouter from "./token";

const proposalRouter = new Hono();

proposalRouter.route("/:token", proposalTokenRouter);

export default proposalRouter;
