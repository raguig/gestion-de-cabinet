import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import patientRoutes from "./routes/patientRoutes.js";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import mealPlannerRoutes from "./routes/mealPlannerRoutes.js";
import { initializeSubscriptionCron } from "./utils/subscriptionCron.js";
import Patient from "./models/Patient.js";

dotenv.config();

const app = express();

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: [
    "https://projet-amine-front.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://projet-amine-front.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ];
  
  const origin = req.headers.origin;
  
  // Always set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`Preflight request from ${origin} for ${req.url}`);
    return res.status(204).end();
  }
  
  console.log(`${req.method} ${req.url} from ${origin}`);
  next();
});


app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mealplanner", mealPlannerRoutes);

// ✅ Connect DB once on cold start
connectDB().then(() => {
  initializeSubscriptionCron();
  
  const checkInactivePatients = async () => {
    try {
      const patients = await Patient.find({
        status: "en cours",
        status: { $nin: ["abandonne"] },
      });
      
      for (const patient of patients) {
        await Patient.checkInactiveStatus(patient._id);
      }
    } catch (error) {
      console.error("Error checking inactive patients:", error);
    }
  };
  
  setInterval(checkInactivePatients, 24 * 60 * 60 * 1000);
  checkInactivePatients();
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

export default app;