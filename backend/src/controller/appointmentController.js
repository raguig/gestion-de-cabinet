import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { TIER_LIMITS } from "../middleware/subscriptionLimits.js";

export const getAppointments = async (req, res) => {
  try {
    const doctorId = req.query.doctorId;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .sort({ date: 1, hour: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des rendez-vous",
      error: error.message
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Rendez-vous non trouvé" 
      });
    }
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur" 
    });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { fullname, number, objectives, date, hour, status, doctor } = req.body;

    if (!fullname || !number || !objectives || !date || !hour || !doctor) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires."
      });
    }

    // Check subscription limit
    const doctorDoc = await Doctor.findById(doctor);
    const tier = doctorDoc.subscription.tier;
    const currentUsage = doctorDoc.subscription.monthlyUsage.appointments;
    const limit = TIER_LIMITS[tier].appointments;

    if (currentUsage >= limit && limit !== Infinity) {
      return res.status(403).json({
        success: false,
        message: `Vous avez atteint votre limite mensuelle de rendez-vous (${limit}) pour votre abonnement ${tier}`
      });
    }

    const newAppointment = new Appointment({
      fullname,
      number,
      objectives,
      date: new Date(date),
      hour,
      status: status || "confirme",
      doctor
    });

    const savedAppointment = await newAppointment.save();

    // Update doctor's monthly usage
    


    res.status(201).json({
      success: true,
      message: "Rendez-vous créé avec succès",
      appointment: savedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du rendez-vous",
      error: error.message
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, number, objectives, date, hour, status, doctor } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé"
      });
    }

    // Validate status
    if (status && !["arrive", "termine", "reprogramme", "confirme"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        fullname,
        number,
        objectives,
        date: new Date(date),
        hour,
        status,
        doctor
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Rendez-vous modifié avec succès",
      appointment: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du rendez-vous",
      error: error.message
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Rendez-vous non trouvé" 
      });
    }

    await appointment.deleteOne();
    res.status(200).json({ 
      success: true,
      message: "Rendez-vous supprimé avec succès" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur" 
    });
  }
};