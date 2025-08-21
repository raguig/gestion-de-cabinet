import express from 'express';
import cors from "cors";
import serverless from "serverless-http";
import authRoutes from "../src/routes/auth.js";
import patientRoutes from "../src/routes/patientRoutes.js";
// ...import other routers as needed...

const app = express();

app.use(cors({
  origin: "https://projet-amine-front.vercel.app",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// quick preflight handler (ensures OPTIONS returns ok)
app.options("*", (req, res) => res.sendStatus(204));

app.use(express.json());

// health check (helps verify deployment)
app.get("/", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "unknown" }));

// mount routers without /api prefix because rewrite sends /api/* -> this file
app.use("/auth", authRoutes);
app.use("/patients", patientRoutes);
// ...other app.use(...)...

// minimal error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "internal" });
});

// export serverless handler for Vercel
export default serverless(app);
