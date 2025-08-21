import serverless from "serverless-http";
import app from "../src/server.js";

// ensure preflight handled
app.options("*", (req, res) => res.sendStatus(204));app.options("*", (req, res) => res.sendStatus(204));



export default serverless(app);
