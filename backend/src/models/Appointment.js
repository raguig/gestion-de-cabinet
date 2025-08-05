import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  objectives: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  hour: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
}, {
  timestamps: true,
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;