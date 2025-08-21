import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import PatientVisit from '../models/PatientVisit.js';
import { TIER_LIMITS } from '../middleware/subscriptionLimits.js';
import bcrypt from "bcryptjs";

// @desc    Add a new doctor
// @route   POST /api/doctors
// @access  Public
export const addDoctor = async (req, res) => {
  try {
    const { 
      firstname, 
      lastname, 
      email, 
      phone, 
      specialty, 
      password,
      gender,
      subscription 
    } = req.body;

    // Basic validation
    if (!firstname || !email || !password) {
      return res.status(400).json({ 
        message: "First name, email and password are required" 
      });
    }

    // Check if doctor exists
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({ 
        message: "Doctor with this email already exists" 
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (subscription?.isAnnual ? 365 : 30));

    // Create new doctor
    const newDoctor = new Doctor({
      firstname,
      lastname: lastname || "",
      email: email.toLowerCase(),
      phone,
      specialty: specialty || "",
      password,
      gender,
      subscription: {
        tier: subscription?.tier || 'essentiel',
        startDate,
        endDate,
        isAnnual: subscription?.isAnnual || false,
        isActive: true,
        monthlyUsage: {
          appointments: 0,
          nutritionPlans: 0,
          workoutPlans: 0,
          aiDiets: 0
        }
      }
    });

    const savedDoctor = await newDoctor.save();

    res.status(201).json({
      success: true,
      doctor: {
        id: savedDoctor._id,
        firstname: savedDoctor.firstname,
        lastname: savedDoctor.lastname,
        email: savedDoctor.email,
        phone: savedDoctor.phone,
        specialty: savedDoctor.specialty,
        gender: savedDoctor.gender,
        subscription: savedDoctor.subscription,
        patientsCount: 0
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
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

    // Map doctors with their patient counts and subscription data
    const formattedDoctors = await Promise.all(doctors.map(async (doctor) => {
      const doctorId = doctor._id.toString();
      return {
        id: doctorId,
        firstname: doctor.firstname,
        lastname: doctor.lastname,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty || "N/A",
        gender: doctor.gender,
        patientsCount: patientCounts.perDoctor[doctorId] || 0,
        subscription: doctor.subscription ? {
          tier: doctor.subscription.tier,
          isAnnual: doctor.subscription.isAnnual,
          isActive: doctor.subscription.isActive,
          startDate: doctor.subscription.startDate,
          endDate: doctor.subscription.endDate,
          monthlyUsage: {
            appointments: doctor.subscription.monthlyUsage?.appointments || 0,
            nutritionPlans: doctor.subscription.monthlyUsage?.nutritionPlans || 0,
            workoutPlans: doctor.subscription.monthlyUsage?.workoutPlans || 0,
            aiDiets: doctor.subscription.monthlyUsage?.aiDiets || 0
          }
        } : {
          tier: 'essentiel',
          isAnnual: false,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          monthlyUsage: {
            appointments: 0,
            nutritionPlans: 0,
            workoutPlans: 0,
            aiDiets: 0
          }
        }
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
        firstname: doctor.firstname,
        lastname: doctor.lastname,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty || "N/A",
        status: doctor.status || "inactive",
        patientsCount: doctor.patientsCount || 0,
        gender: doctor.gender, // Add this line
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
  const { 
    firstname, 
    lastname, 
    email, 
    phone, 
    specialty, 
    password,
    gender,
    subscription 
  } = req.body;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update subscription dates if tier or billing cycle changes
    let subscriptionUpdate = {};
    if (subscription) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (subscription.isAnnual ? 365 : 30));

      subscriptionUpdate = {
        'subscription.tier': subscription.tier,
        'subscription.isAnnual': subscription.isAnnual,
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
        'subscription.isActive': true
      };
    }

  let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }


    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      {
        $set: {
          firstname: firstname || doctor.firstname,
          lastname: lastname || doctor.lastname,
          email: email || doctor.email,
          phone: phone || doctor.phone,
          specialty: specialty || doctor.specialty,
          password: hashedPassword || doctor.password,
          gender: gender || doctor.gender,
          ...subscriptionUpdate
        }
      },
      { new: true }
    );

    const doctorResponse = updatedDoctor.toObject();
    delete doctorResponse.password;

    res.status(200).json({
      success: true,
      doctor: doctorResponse
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
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

// Update the getClosestAppointments function to match dashboard needs
const getClosestAppointments = async (doctorId) => {
  const now = new Date();
  try {
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: now },
      status: { $in: ["confirme", "arrive"] }
    })
    .sort({ date: 1, hour: 1 })
    .limit(5)
    .lean();

    // Format appointments for dashboard display
    return appointments.map(apt => ({
      name: apt.fullname,
      phone: apt.number,
      time: apt.hour,
      objective: {
        fr: apt.objectives,
        en: apt.objectives
      },
      type: {
        fr: apt.status === "confirme" ? "Consultation confirmée" : "Patient arrivé",
        en: apt.status === "confirme" ? "Confirmed consultation" : "Patient arrived"
      },
      status: apt.status
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
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

// Helper function to get weekly stats
const getWeeklyStats = async (doctorId) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  
  const stats = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const count = await Appointment.countDocuments({
      doctor: doctorId,
      date: {
        $gte: date,
        $lt: nextDay
      }
    });

    stats.push({
      day: days[i],
      actual: count,
      target: 8 // Default target, can be made configurable
    });
  }

  return stats;
};

// Update the getPatientProgress function
const getPatientProgress = async (doctorId) => {
  try {
    const patients = await Patient.find({ doctor: doctorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    console.error(patients);
    const formattedPatients = patients.map(patient => {
      // Get the raw status from the patient
      
      
      return {
        name: `${patient.firstname}----- ${patient.lastname}`,
        age: calculateAge(patient.dateOfBirth),
        startDate: new Date(patient.createdAt).toLocaleDateString(),
        status:  patient.status,
      };
    });
    
    return formattedPatients;
  } catch (error) {
    console.error('Error in getPatientProgress:', error);
    return [];
  }
};

// Update the translate status function to handle all cases
const translateStatus = (status) => {
  // First normalize the status to lowercase and remove accents
  const normalizedStatus = status.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const translations = {
    'en cours': 'In Progress',
    'inactif': 'Inactive',
    'reussi': 'Success',
    'abandonne': 'Abandoned',
    'abandonnee': 'Abandoned',
  };

  return translations[normalizedStatus] || status;
};

// Helper function to get appointment stats
const getAppointmentStats = async (doctorId, today, tomorrow) => {
  const appointmentStats = await Appointment.aggregate([
    {
      $match: {
        doctor: new mongoose.Types.ObjectId(doctorId)
      }
    },
    {
      $facet: {
        today: [
          {
            $match: {
              date: {
                $gte: today,
                $lt: tomorrow
              }
            }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ],
        total: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  // Format stats
  const stats = {
    appointments: {
      today: {
        total: 0,
        arrive: 0,
        termine: 0,
        reprogramme: 0,
        confirme: 0
      },
      total: {
        total: 0,
        arrive: 0,
        termine: 0,
        reprogramme: 0,
        confirme: 0
      }
    }
  };

  // Process stats
  if (appointmentStats[0]) {
    appointmentStats[0].today.forEach(stat => {
      stats.appointments.today[stat._id] = stat.count;
      stats.appointments.today.total += stat.count;
    });

    appointmentStats[0].total.forEach(stat => {
      stats.appointments.total[stat._id] = stat.count;
      stats.appointments.total.total += stat.count;
    });
  }

  return stats;
};

// Helper function to calculate age (already present in your code)
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Add this function to get alerts for a specific doctor's patients
export const getPatientAlerts = async (req, res) => {
  try {
    // Get doctor ID from token
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    const doctorId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get all patients for this doctor
    const patients = await Patient.find({ doctor: doctorId });

    if (!patients.length) {
      return res.json({
        alerts: [],
        total: 0,
        pages: 0
      });
    }

    const patientIds = patients.map(patient => patient._id);

    // Get latest visits with critical BMI
    const latestVisits = await PatientVisit.aggregate([
      {
        $match: {
          patient: { $in: patientIds }
        }
      },
      {
        $sort: { visitDate: -1 }
      },
      {
        $group: {
          _id: "$patient",
          visitDate: { $first: "$visitDate" },
          bmi: { $first: "$bmi" }
        }
      },
      {
        $match: {
          $or: [
            { bmi: { $lt: 17 } },
            { bmi: { $gte: 30 } }
          ]
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Get total count
    const totalCount = await PatientVisit.aggregate([
      {
        $match: {
          patient: { $in: patientIds }
        }
      },
      {
        $sort: { visitDate: -1 }
      },
      {
        $group: {
          _id: "$patient",
          bmi: { $first: "$bmi" }
        }
      },
      {
        $match: {
          $or: [
            { bmi: { $lt: 17 } },
            { bmi: { $gte: 30 } }
          ]
        }
      },
      { $count: "total" }
    ]);

    // Create patient lookup map
    const patientMap = new Map(
      patients.map(p => [p._id.toString(), p])
    );

    // Format alerts
    const alerts = latestVisits.map(visit => {
      const patient = patientMap.get(visit._id.toString());
      if (!patient) return null;

      return {
        _id: visit._id,
        name: `${patient.firstname} ${patient.lastname}`,
        bmi: Number(visit.bmi.toFixed(1)),
        age: calculateAge(patient.dateOfBirth),
        lastVisit: new Date(visit.visitDate).toLocaleDateString()
      };
    }).filter(Boolean); // Remove any null values

    res.json({
      alerts,
      total: totalCount[0]?.total || 0,
      pages: Math.ceil((totalCount[0]?.total || 0) / limit)
    });

  } catch (error) {
    console.error('Error in getPatientAlerts:', error);
    res.status(500).json({
      message: "Error fetching patient alerts",
      error: error.message
    });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { tier, isAnnual } = req.body;
    const doctorId = req.params.id;

    if (!['essentiel', 'premium', 'pro'].includes(tier)) {
      return res.status(400).json({ message: "Invalid subscription tier" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Calculate subscription end date (1 year or 1 month from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (isAnnual ? 365 : 30));

    doctor.subscription = {
      tier,
      startDate: new Date(),
      endDate,
      isAnnual,
      isActive: true,
      monthlyUsage: {
        appointments: 0,
        nutritionPlans: 0,
        workoutPlans: 0,
        aiDiets: 0
      }
    };

    await doctor.save();

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription: doctor.subscription
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription" });
  }
};

// Add to doctorRoutes.js:
// router.put('/:id/subscription', protect, requireAdmin, updateSubscription);

// Add this new function
export const getSubscriptionUsage = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const usage = {
      tier: doctor.subscription.tier,
      isAnnual: doctor.subscription.isAnnual,
      endDate: doctor.subscription.endDate,
      monthlyUsage: doctor.subscription.monthlyUsage,
      limits: TIER_LIMITS[doctor.subscription.tier]
    };

    res.status(200).json({
      success: true,
      ...usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subscription usage",
      error: error.message
    });
  }
};