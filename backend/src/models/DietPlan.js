import mongoose from "mongoose";

const dietPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    meals: {
      breakfast: { type: String },
      morningSnack: { type: String },
      lunch: { type: String },
      afternoonSnack: { type: String },
      dinner: { type: String },
    },
  },
  { timestamps: true }
);

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);
export default DietPlan;