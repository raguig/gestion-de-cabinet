import mongoose from "mongoose";

const patientVisitSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  visitDate: { type: Date, default: Date.now },
  weight: { type: Number, required: true },
  bf: { type: Number }, 
  bmi: { type: Number },
  basemetabolisme: { type: Number },
  activemetabolisme: { type: Number },
  calorieintake: { type: Number },
  healthScore: { type: Number },
  rythm: { type: Number },
  diet: { type: mongoose.Schema.Types.ObjectId, ref: "DietPlan", default: null }, // New field
}, { timestamps: true });

const PatientVisit = mongoose.model("PatientVisit", patientVisitSchema);
export default PatientVisit;