import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';
import Patient from './models/Patient.js';
import { initializeSubscriptionCron } from './utils/subscriptionCron.js';

import patientRoutes from './routes/patientRoutes.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from "./routes/doctorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { updateInactivePatients } from './controller/patientController.js';
import aiRoutes from './routes/aiRoutes.js';
import mealPlannerRoutes from './routes/mealPlannerRoutes.js';
dotenv.config();


const app = express();

// Update allowedOrigins to include your local API URL
const allowedOrigins = [
    'https://projet-amine-front.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Update routes to remove /api prefix
app.use('/api/auth',authRoutes);
app.use('/api/patients/',patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/", dashboardRoutes);

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
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
export default app;
