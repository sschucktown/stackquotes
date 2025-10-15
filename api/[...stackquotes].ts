import { Hono } from "hono";
import { clientsRouter } from "../apps/api/src/routes/clients.js";

const app = new Hono();

app.route("/api/clients", clientsRouter);

export const config = {
  runtime: "edge",
};

export default app;
