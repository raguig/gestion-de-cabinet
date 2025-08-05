import express from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorStats,
} from "../controller/doctorController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", addDoctor);
router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);
router.get('/:id/stats', getDoctorStats);

export default router;