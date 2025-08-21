import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import patientRoutes from './routes/patientRoutes.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from "./routes/doctorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiRoutes from './routes/aiRoutes.js';
import mealPlannerRoutes from './routes/mealPlannerRoutes.js';
import { initializeSubscriptionCron } from './utils/subscriptionCron.js';
import Patient from './models/Patient.js';

dotenv.config();

const app = express();

// CORS must be added before routes
app.use(
  cors({
    origin: "https://projet-amine-front.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Respond to preflight immediately
app.options("*", (req, res) => res.sendStatus(204));

app.use(express.json());

// Update routes to remove /api prefix
app.use('/api/auth',authRoutes);
app.use('/api/patients/',patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/", dashboardRoutes);
app.use("/api/ai/", aiRoutes);
app.use("/api/mealplanner/", mealPlannerRoutes);

// Connect to database immediately
connectDB().then(() => {
  // Initialize subscription cron job
  initializeSubscriptionCron();
  
  // Schedule periodic check for inactive patients
  const checkInactivePatients = async () => {
    try {
      const patients = await Patient.find({ 
        status: 'en cours',
        status: { $nin: ['abandonne'] }
      });
      
      for (const patient of patients) {
        await Patient.checkInactiveStatus(patient._id);
      }
    } catch (error) {
      console.error('Error checking inactive patients:', error);
    }
  };

  // Run check every 24 hours
  setInterval(checkInactivePatients, 24 * 60 * 60 * 1000);

  // Run initial check on server start
  checkInactivePatients();

  // Start server

}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
export default app;
