import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";

// @desc    Add a new doctor
// @route   POST /api/doctors
// @access  Public
export const addDoctor = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, specialty, password } = req.body;

    // Basic validation
    if (!firstname || !email || !phone || !password) {
      return res.status(400).json({ 
        message: "Les champs prénom, email, téléphone et mot de passe sont requis" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    // Check if doctor exists
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({ 
        message: "Un docteur avec cet email existe déjà" 
      });
    }
    // Create new doctor
    const newDoctor = new Doctor({
      firstname,
      lastname: lastname || "",
      email: email.toLowerCase(),
      phone,
      specialty: specialty || "",
     
      password
    });

    const savedDoctor = await newDoctor.save();

    // Format response
    res.status(201).json({
      id: savedDoctor._id,
      fullName: `${savedDoctor.firstname} ${savedDoctor.lastname}`.trim(),
      email: savedDoctor.email,
      phone: savedDoctor.phone,
      specialty: savedDoctor.specialty,
     
      patientsCount: 0
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// Update the getPatientCounts function
const getPatientCounts = async () => {
  try {
    // Get total patients
    const totalPatients = await Patient.countDocuments();
    
    // Get patients per doctor using the correct field name 'doctor'
    const doctorCounts = await Patient.aggregate([
      {
        $group: {
          _id: "$doctor", // Changed from doctorId to doctor
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: totalPatients,
      perDoctor: doctorCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count; // Convert ObjectId to string
        return acc;
      }, {})
    };
  } catch (error) {
    return { total: 0, perDoctor: {} };
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({isAdmin: false});
    const patientCounts = await getPatientCounts();

    // Map doctors with their patient counts
    const formattedDoctors = await Promise.all(doctors.map(async (doctor) => {
      const doctorId = doctor._id.toString();
      return {
        id: doctorId,
        firstname: doctor.firstname,
        lastname: doctor.lastname,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty || "N/A",
        patientsCount: patientCounts.perDoctor[doctorId] || 0,
      };
    }));

    res.status(200).json({
      doctors: formattedDoctors,
      totalPatients: patientCounts.total
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid doctor ID format" });
  }

  try {
    const doctor = await Doctor.findById(id);

    if (doctor) {
      const formattedDoctor = {
        id: doctor._id,
        fullName: `${doctor.firstname} ${doctor.lastname}`,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty || "N/A",
        status: doctor.status || "inactive",
        patientsCount: doctor.patientsCount || 0,
      };
      res.status(200).json(formattedDoctor);
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Public
export const updateDoctor = async (req, res) => {
  const { id } = req.params;
    const { firstname, lastname, email, phone, specialty, password } = req.body;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid doctor ID format" });
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
  }

  try {
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== doctor.email) {
      const existingDoctor = await Doctor.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id } // Exclude current doctor
      });
      if (existingDoctor) {
        return res.status(400).json({ message: "Doctor with this email already exists" });
      }
    }

    // Split fullName into firstname and lastname if provided
    doctor.firstname = firstname || doctor.firstname;
    doctor.lastname = lastname || doctor.lastname;

    doctor.email = email ? email.toLowerCase() : doctor.email;
    doctor.phone = phone || doctor.phone;
    doctor.specialty = specialty || doctor.specialty;

       if (password) {
        doctor.password = password; // Password will be hashed by the pre-save hook
      }
    const updatedDoctor = await doctor.save();
    
    res.status(200).json({
      id: updatedDoctor._id,
      firstname: updatedDoctor.firstname,
      lastname: updatedDoctor.lastname,
      email: updatedDoctor.email,
      phone: updatedDoctor.phone,
      specialty: updatedDoctor.specialty,
      patientsCount: updatedDoctor.patientsCount || 0,
      password: updatedDoctor.password // Include password if needed, but consider security implications
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Public
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid doctor ID format" });
  }

  try {

const deletedPatients = await Patient.deleteMany({ doctor: id });
    const deletedAppointments = await Appointment.deleteMany({ doctor: id });
    const doctor = await Doctor.findByIdAndDelete(id);

    if (doctor) {
      res.status(200).json({ message: "Doctor removed successfully" });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get appointments for today
    const todayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Get patients for current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyPatients = await Patient.countDocuments({
      doctor: doctorId,
      createdAt: { $gte: firstDayOfMonth }
    });

    // Get total patients
    const totalPatients = await Patient.countDocuments({ doctor: doctorId });

    res.status(200).json({
      todayAppointments,
      monthlyPatients,
      totalPatients
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching doctor statistics", 
      error: error.message 
    });
  }
};