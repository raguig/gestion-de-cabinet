import serverless from "serverless-http";
import app from "../src/server.js";

// ensure preflight handled at entrypoint (safe even if server.js uses cors)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://projet-amine-front.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(204);
});

// keep error handler so Vercel surfaces failures
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ message: "Something went wrong!" });
});

// Export the serverless wrapper
export default serverless(app);