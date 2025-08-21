import serverless from "serverless-http";
import app from "../src/server.js";

// Export the serverless wrapper
export default serverless(app);