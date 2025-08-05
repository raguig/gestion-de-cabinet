import express from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controller/appointmentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get all appointments
router.get("/",protect, getAppointments);

// Get a single appointment by ID
router.get("/:id",protect, getAppointmentById);

// Create a new appointment
router.post("/",protect, createAppointment);

// Update an existing appointment
router.put("/:id",protect, updateAppointment);

// Delete an appointment
router.delete("/:id",protect, deleteAppointment);

export default router;