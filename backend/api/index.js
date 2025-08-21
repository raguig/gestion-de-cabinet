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

// CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://projet-amine-front.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());

// Routes without /api prefix
app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/doctors', doctorRoutes);
app.use('/', dashboardRoutes);
app.use('/ai', aiRoutes);
app.use('/mealplanner', mealPlannerRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to database
if (process.env.NODE_ENV !== 'production') {
  connectDB().catch(console.error);
}

// Add error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;