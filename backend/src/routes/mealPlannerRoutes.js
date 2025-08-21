import express from 'express';
import { MealPlannerController } from '../controller/mealplannerController.js';
import { protect } from "../middleware/auth.js";
import { checkSubscriptionLimits } from '../middleware/subscriptionLimits.js';

const router = express.Router();

router.get('/patients', protect, MealPlannerController.getDoctorPatients);
router.get('/patients/:patientId', protect, MealPlannerController.getPatientMealPlan);
router.post('/diet', protect,checkSubscriptionLimits('nutritionPlans'), MealPlannerController.saveDietPlan); // Add this line

router.get('/custom-foods', protect, MealPlannerController.getDoctorCustomFoods);
router.post('/custom-foods', protect,checkSubscriptionLimits('nutritionPlans'), MealPlannerController.addCustomFood);
router.delete('/custom-foods/:id', protect, MealPlannerController.deleteCustomFood);

export default router;