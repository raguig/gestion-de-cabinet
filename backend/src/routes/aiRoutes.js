import express from 'express';
import { checkSubscriptionLimits } from '../middleware/subscriptionLimits.js';
import { protect } from "../middleware/auth.js";
import { getPatients, generateDiet } from '../controller/aiController.js';

const router = express.Router();

router.post('/generate-diet',protect,  checkSubscriptionLimits('aiDiets'), generateDiet);
router.get('/patients', protect, getPatients);

export default router;