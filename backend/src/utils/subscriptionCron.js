import cron from 'node-cron';
import Doctor from '../models/Doctor.js';

export const initializeSubscriptionCron = () => {
  // Reset usage counters on the 1st of each month
  cron.schedule('0 0 1 * *', async () => {
    try {
      await Doctor.updateMany(
        { 'subscription.isActive': true },
        {
          $set: {
            'subscription.monthlyUsage': {
              appointments: 0,
              nutritionPlans: 0,
              workoutPlans: 0,
              aiDiets: 0
            }
          }
        }
      );
      console.log('Monthly usage counters reset successfully');
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  });
};