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
import TrainingPlan from "../models/TrainingPlan.js";
import { protect } from "../middleware/auth.js";
import PatientVisit from '../models/PatientVisit.js';
import { checkSubscriptionLimits } from '../middleware/subscriptionLimits.js';

const router = express.Router();

router.post("/add", protect, addPatient); // Add patient
router.delete("/delete/:id", protect, deletePatient); // Delete by ID
router.put("/update/:id", protect, updatePatient); // Update by ID
router.get("/", protect, getPatients); // Get all patients for the logged-in doctor
router.get("/:id", protect, getPatientById); // Get a specific patient by ID
router.get("/visit/:id", protect, getPatientVisits); // Get visits for a specific patient
router.post("/:id/visits", protect, addPatientVisit); // Add a new visit for a specific patient

router.put("/visits/:visitId/assign-diet", protect, assignDietToVisit); // Assign diet to a visit

router.post("/diets", protect,checkSubscriptionLimits('nutritionPlans'), addDietPlan); // Add a new diet plan
router.post('/trainings',protect,checkSubscriptionLimits('workoutPlans'), async (req, res) => {
  try {
       

    const trainingPlan = new TrainingPlan(req.body);
    await trainingPlan.save();
    res.status(201).json({ trainingPlan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign training to visit
router.put('/visits/:visitId/assign-training',protect, async (req, res) => {
  try {
    const visit = await PatientVisit.findById(req.params.visitId);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    visit.training = req.body.trainingId;
    await visit.save();
    
    res.json({ message: 'Training plan assigned successfully', visit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
export default router;


router.delete('/visits/:visitId/diet', protect, async (req, res) => {
  try {
    const visit = await PatientVisit.findById(req.params.visitId);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    visit.diet = null; // Remove the diet reference
    await visit.save();
    
    res.json({ message: 'Diet removed successfully', visit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/visits/:visitId/training', protect, async (req, res) => {
  try {
    const visit = await PatientVisit.findById(req.params.visitId);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
   
    visit.training = null; // Remove the diet reference
    await visit.save();
    
    res.json({ message: 'Training Plan removed successfully', visit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add this route with your other routes
router.get('/visits/:visitId/training', protect, async (req, res) => {
  try {
    const visit = await PatientVisit.findById(req.params.visitId)
      .populate('training'); // Populate the training field
    
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (!visit.training) {
      return res.status(404).json({ message: 'No training plan assigned to this visit' });
    }
    
    res.json({ trainingPlan: visit.training });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});