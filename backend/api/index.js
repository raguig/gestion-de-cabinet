import serverless from "serverless-http";
import app from "../src/server.js";

// ensure preflight is handled at the function entrypoint (safe even if server.js already uses cors)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://projet-amine-front.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(204);
});

// keep an error handler so failures surface
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ message: "Something went wrong!" });
});

// export default the serverless wrapper Vercel expects
export default serverless(app);