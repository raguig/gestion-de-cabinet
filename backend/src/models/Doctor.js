import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const doctorSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  specialty: { type: String },
   password: { type: String, required: true },
   isAdmin: { type: Boolean, default: false },
  patientsCount: { 
    type: Number,
    default: 0
  }
});

 doctorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

doctorSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;

