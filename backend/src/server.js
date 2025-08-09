import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';

import patientRoutes from './routes/patientRoutes.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from "./routes/doctorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

// Update allowedOrigins to include your local API URL
const allowedOrigins = [
    'https://prod-front.vercel.app',
    'https://prod-front-n2ifynuv4-raguigs-projects.vercel.app',
    'https://gestion-cabinet-front-dbb7aqeiw-raguigs-projects.vercel.app',
    'https://gestion-cabinet-front-raguigs-projects.vercel.app',
    'https://amine-front.vercel.app',
    'https://amine-front-i3vxtnnds-raguigs-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://projet-amine-front.vercel.app',
    'https://projet-amine-front-4qq0rhguo-raguigs-projects.vercel.app',
    process.env.VITE_API_URL // Add the API URL from environment variables
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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
connectDB();

export default app;
