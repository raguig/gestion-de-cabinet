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


const allowedOrigins = [
  "https://projet-amine-front.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS","PATCH"]
}));


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