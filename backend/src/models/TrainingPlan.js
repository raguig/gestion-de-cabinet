import mongoose from "mongoose";

const trainingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    level: { type: String, required: true },
    equipment: [{ type: String }],
    exercises: [{
      day: String,
      title: String,
      workouts: [{
        name: String,
        sets: Number,
        reps: String,
        duration: String,
        note: String
      }]
    }]
  },
  { timestamps: true }
);

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);
export default TrainingPlan;