import express from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorStats,
  getPatientAlerts,
  getSubscriptionUsage,
} from "../controller/doctorController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAdmin, addDoctor);
router.get("/", requireAdmin, getDoctors);
router.get("/:id", protect, getDoctorById);
router.put("/:id", requireAdmin, updateDoctor);
router.delete("/:id", requireAdmin, deleteDoctor);
router.get("/:id/stats", protect, getDoctorStats);
router.get("/patients/alerts", protect, getPatientAlerts);
router.get("/subscription/usage", protect, getSubscriptionUsage);

export default router;