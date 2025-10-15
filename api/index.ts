// @ts-nocheck
import { createApp } from "../apps/api/src/app.js";

const app = createApp();

// Vercel Edge Function config
export const config = { runtime: "edge" };
export default app;
