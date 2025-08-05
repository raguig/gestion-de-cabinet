import express from 'express';
import { getDashboardStats } from '../controller/dashboardController.js';
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get('/stats', protect, getDashboardStats);

export default router;