import { createApp } from "../apps/api/src/app";

const app = createApp();

export const config = {
  runtime: "edge",
};

export default app.fetch;
