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
   goal: {
    type: String,
    required: true,
    enum: ['weight loss', 'muscle gain', 'maintenance'],
  },
  diet: { type: mongoose.Schema.Types.ObjectId, ref: "DietPlan", default: null },
  training: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingPlan", default: null }, // New field
}, { timestamps: true });

// Update the post-save hook
patientVisitSchema.post('save', async function() {
  try {
    const Patient = mongoose.model('Patient');
    const patient = await Patient.findById(this.patient);
    if (!patient) return;

    // Check inactive status first
    await Patient.checkInactiveStatus(this.patient);

    // Then check target weight status
    const translatedGoal = 
      this.goal === 'weight loss' ? 'perte' :
      this.goal === 'muscle gain' ? 'gain' : 'maintenance';

    const isTargetReached = 
      (translatedGoal === 'perte' && this.weight <= patient.targetWeight) ||
      (translatedGoal === 'gain' && this.weight >= patient.targetWeight) ||
      (translatedGoal === 'maintenance' && Math.abs(this.weight - patient.targetWeight) <= 1);

    if (isTargetReached && patient.status !== 'reussi') {
      patient.status = 'reussi';
      await patient.save();
    } else if (!isTargetReached && patient.status === 'reussi') {
      patient.status = 'en cours';
      await patient.save();
    }

    // Reset inactive status when there's a new visit
    if (patient.status === 'inactif') {
      patient.status = 'en cours';
      await patient.save();
    }
  } catch (error) {
    console.error('Error in PatientVisit post-save hook:', error);
  }
});

// Add a scheduled task to check inactive status
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      const Patient = mongoose.model('Patient');
      const patients = await Patient.find({ 
        status: 'en cours',
        // Don't check abandoned patients
        status: { $nin: ['abandonne'] }
      });
      
      for (const patient of patients) {
        await Patient.checkInactiveStatus(patient._id);
      }
    } catch (error) {
      console.error('Error checking inactive status:', error);
    }
  }, 24 * 60 * 60 * 1000); // Check once per day
}

const PatientVisit = mongoose.model("PatientVisit", patientVisitSchema);
export default PatientVisit;