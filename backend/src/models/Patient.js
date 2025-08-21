import mongoose from "mongoose";



const patientSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  sex: { type: String, required: true, enum: ['male', 'female'] },
  dateOfBirth: { type: Date, required: true },
  height: { type: Number, required: true },
  activityLevel: {
    type: String,
    required: true,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very active'],
  },
  lastmeasurement: { type: Date, required: true },
  pathalogie: { type: String },
  allergie: { type: String },
  
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  targetWeight: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['inactif', 'en cours', 'reussi', 'abandonne'],
    default: 'en cours'
  }
}, {
  timestamps: true
});

// Update middleware to check inactive status using lastmeasurement
patientSchema.pre('save', async function(next) {
  // Skip this middleware if status is being explicitly set
  if (this.isModified('status')) {
    return next();
  }

  // Don't change status if patient has abandoned
  if (this.status === 'abandonne') {
    return next();
  }

  try {
    if (this.lastmeasurement) {
      const daysSinceLastMeasurement = Math.floor(
        (Date.now() - new Date(this.lastmeasurement).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastMeasurement > 21 && this.status === 'en cours') {
        this.status = 'inactif';
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Update the static method to use lastmeasurement
patientSchema.statics.checkInactiveStatus = async function(patientId) {
  const patient = await this.findById(patientId);
  if (!patient || patient.status === 'abandonne') return;

  if (patient.lastmeasurement) {
    const daysSinceLastMeasurement = Math.floor(
      (Date.now() - new Date(patient.lastmeasurement).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastMeasurement > 21 && patient.status === 'en cours') {
      patient.status = 'inactif';
      await patient.save();
    }
  }
};



export default mongoose.model('Patient', patientSchema);
