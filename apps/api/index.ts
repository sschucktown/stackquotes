import { createApp } from "./src/app.js";

const app = createApp();

export const config = {
  runtime: "edge",
};

export default app.fetch;
