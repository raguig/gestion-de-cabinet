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
  }
}, {
  timestamps: true
});



export default mongoose.model('Patient', patientSchema);
