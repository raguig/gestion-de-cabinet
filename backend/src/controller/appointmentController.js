import Appointment from "../models/Appointment.js";

// Get all appointments for a specific doctor

export const getAppointments = async (req, res) => {
  try {
    const doctorId = req.query.doctorId;

    if (!doctorId) {
      return res.status(400).json({
        message: "Doctor ID is required"
      });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .sort({ date: 1, hour: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous",
      error: error.message
    });
  }
};

// Get a single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
   
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Create a new appointment with doctor reference
export const createAppointment = async (req, res) => {
  try {
    const { fullname, number, objectives, date, hour, status, doctor } = req.body;

    if (!fullname || !number || !objectives || !date || !hour || !doctor) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires."
      });
    }

    const newAppointment = new Appointment({
      fullname,
      number,
      objectives,
      date: new Date(date),
      hour,
      status: status || "scheduled",
      doctor
    });

    const savedAppointment = await newAppointment.save();

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
// Update an existing appointment
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

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    await appointment.deleteOne();
    res.status(200).json({ message: "Appointment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};