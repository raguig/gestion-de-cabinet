import express from 'express';
import { connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import patientRoutes from '../src/routes/patientRoutes.js';
import authRoutes from '../src/routes/auth.js';
import appointmentRoutes from '../src/routes/appointmentRoutes.js';
import doctorRoutes from "../src/routes/doctorRoutes.js";
import dashboardRoutes from "../src/routes/dashboardRoutes.js";
import aiRoutes from '../src/routes/aiRoutes.js';
import mealPlannerRoutes from '../src/routes/mealPlannerRoutes.js';
import { initializeSubscriptionCron } from '../src//utils/subscriptionCron.js';
import Patient from '../src/models/Patient.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://projet-amine-front.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth',authRoutes);
app.use('/api/patients/',patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/", dashboardRoutes);
app.use("/api/ai/", aiRoutes);
app.use("/api/mealplanner/", mealPlannerRoutes);
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || 'Something went wrong!' 
  });
});

// Database connection
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
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

export default app;