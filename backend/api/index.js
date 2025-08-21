import serverless from "serverless-http";
import app from "../src/server.js";

// Wrap express app into a serverless function
export const handler = serverless(app);
