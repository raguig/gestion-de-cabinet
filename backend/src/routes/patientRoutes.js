import express from "express";
import {
  addPatient,
  deletePatient,
  updatePatient,
  getPatients,
  getPatientById,
  getPatientVisits,
  addPatientVisit,
  assignDietToVisit,
  addDietPlan
} from "../controller/patientController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", protect, addPatient); // Add patient
router.delete("/delete/:id", protect, deletePatient); // Delete by ID
router.put("/update/:id", protect, updatePatient); // Update by ID
router.get("/", protect, getPatients); // Get all patients for the logged-in doctor
router.get("/:id", protect, getPatientById); // Get a specific patient by ID
router.get("/visit/:id", protect, getPatientVisits); // Get visits for a specific patient
router.post("/:id/visits", protect, addPatientVisit); // Add a new visit for a specific patient

router.put("/visits/:visitId/assign-diet", protect, assignDietToVisit); // Assign diet to a visit

router.post("/diets", protect, addDietPlan); // Add a new diet plan
export default router;