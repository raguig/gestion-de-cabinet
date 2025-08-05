import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import cors from 'cors';
import doctorRoutes from "./routes/doctorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
const app= express();
const PORT= process.env.PORT || 8000;

app.use(cors({
    origin: 'http://localhost:8080', 
    credentials: true
}));
app.use(express.json());


app.use('/api/auth',authRoutes);
app.use('/api/patients/',patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/", dashboardRoutes);

connectDB().then(()=>{  
app.listen(PORT,()=>{
    console.log("Server is running on port:", PORT);
});
});