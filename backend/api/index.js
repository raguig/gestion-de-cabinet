import express from 'express';
import cors from 'cors';
import { connectDB } from '../src/config/db.js';
import authRoutes from '../src/routes/auth.js';
import patientRoutes from '../src/routes/patientRoutes.js';
import appointmentRoutes from '../src/routes/appointmentRoutes.js';
import doctorRoutes from '../src/routes/doctorRoutes.js';
import dashboardRoutes from '../src/routes/dashboardRoutes.js';
import aiRoutes from '../src/routes/aiRoutes.js';
import mealPlannerRoutes from '../src/routes/mealPlannerRoutes.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: 'https://projet-amine-front.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.status(204).end();
});

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes without /api prefix
app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/doctors', doctorRoutes);
app.use('/', dashboardRoutes);
app.use('/ai', aiRoutes);
app.use('/mealplanner', mealPlannerRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


  connectDB().catch(console.error);


export default app;