import Doctor from "../models/Doctor.js";

export const TIER_LIMITS = {
  essentiel: {
    appointments: 100,
    nutritionPlans: 120,
    workoutPlans: 80,
    aiDiets: 60
  },
  premium: {
    appointments: 300,
    nutritionPlans: 1300,
    workoutPlans: 800,
    aiDiets: 525
  },
  pro: {
    appointments: Infinity,
    nutritionPlans: Infinity,
    workoutPlans: Infinity,
    aiDiets: Infinity
  }
};

export const checkSubscriptionLimits = (feature) => async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user._id);
    
    if (!doctor.subscription?.isActive) {
      return res.status(403).json({ 
        message: "Subscription inactive",
        feature,
        currentUsage: doctor.subscription?.monthlyUsage[feature] || 0,
        limit: 0
      });
    }

    const tier = doctor.subscription.tier;
    const currentUsage = doctor.subscription.monthlyUsage[feature];
    const limit = TIER_LIMITS[tier][feature];

    if (currentUsage >= limit && limit !== Infinity) {
      return res.status(403).json({
        message: `You have reached your monthly ${feature} limit for your ${tier} subscription`,
        feature,
        currentUsage,
        limit,
        tier
      });
    }

    // Increment usage counter
    doctor.subscription.monthlyUsage[feature]++;
    await doctor.save();

    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking subscription limits" });
  }
};