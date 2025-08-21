import Patient from '../models/Patient.js';
import PatientVisit from '../models/PatientVisit.js';
import DietPlan from "../models/DietPlan.js";

// 🔹 ADD patient
export const addPatient = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      sex,
      dateOfBirth,
      weight,
      height,
      bf,
      healthScore,
      activityLevel,
      goal,
      rythm,
      lastmeasurement,
      pathalogie,
      allergie,
      targetWeight,
      status = 'en cours'
    } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !sex || !dateOfBirth || !weight || !height || !activityLevel || !goal || !lastmeasurement) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // For maintenance, target weight is optional and defaults to current weight
    if (goal !== 'maintenance' && !targetWeight) {
      return res.status(400).json({ message: 'Target weight is required for non-maintenance goals.' });
    }

    const doctorId = req.user._id;

    const newPatient = new Patient({
      firstname,
      lastname,
      sex,
      dateOfBirth,
      height,
      activityLevel,
      lastmeasurement,
      pathalogie,
      allergie,
      doctor: doctorId,
      targetWeight: goal === 'maintenance' ? weight : targetWeight,
      status
    });

    const savedPatient = await newPatient.save();

    // Calculate metabolic values
    const massemaigre = weight * (1 - (bf/100));
    const metabolismebase = 370 + (21.6 * massemaigre);
    
    let facteur = 1.55;
    if (activityLevel === "sedentary" || activityLevel === "faible") {
      facteur = 1.2;
    } else if (activityLevel === "active" || activityLevel === "elevee") {
      facteur = 1.725;
    }

    const metabolismeactive = facteur * metabolismebase;
    const difficite_calorique = ((rythm || 0) * 7700) / 7;

    // Calculate calorie regime
    let calorie_regime;
    if (goal === "weight loss") {
      calorie_regime = metabolismeactive - difficite_calorique;
    } else if (goal === "muscle gain") {
      calorie_regime = metabolismeactive + difficite_calorique;
    } else {
      calorie_regime = metabolismeactive;
    }

    // Create initial visit
    const initialVisit = new PatientVisit({
      patient: savedPatient._id,
      weight,
      bf,
      bmi: height ? parseFloat((weight / (height / 100) ** 2).toFixed(1)) : null,
      basemetabolisme: parseFloat(metabolismebase.toFixed(1)),
      activemetabolisme: parseFloat(metabolismeactive.toFixed(1)),
      calorieintake: parseFloat(calorie_regime.toFixed(1)),
      healthScore,
      rythm: rythm || 0,
      goal,
    });

    await initialVisit.save();

    res.status(201).json({
      message: 'Patient and initial visit added successfully.',
      patient: savedPatient,
      visit: initialVisit,
    });
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// 🔹 DELETE patient by decrypted CIN
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params; // Extract patient ID from URL

    // Find the patient by ID
    const target = await Patient.findById(id);
    if (!target) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Delete all visits associated with the patient
    await PatientVisit.deleteMany({ patient: id });

    // Delete the patient
    await Patient.findByIdAndDelete(id);

    res.status(200).json({ message: "Patient and associated visits deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
// 🔹 UPDATE patient by decrypted CIN
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params; // Extract patient ID from URL
    const updateData = req.body; // Extract update data from request body

    // Find the patient by ID
    const target = await Patient.findById(id);
    if (!target) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Handle manual status updates
    if (updateData.status === 'abandonne') {
      updateData.status = 'abandonne';
    }

    // Update the patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // If weight, bf, activityLevel, goal, or rythm is included in the update, recalculate formulas
    const { weight, bf, activityLevel, goal, rythm, healthScore } = updateData;
    if (weight || bf || activityLevel || goal || rythm) {
      const height = updatedPatient.height;
      const massemaigre = weight ? weight * (1 - (bf / 100)) : null;
      const metabolismebase = massemaigre ? 370 + (21.6 * massemaigre) : null;

      let facteur = 1.55; // Default activity level factor
      if (activityLevel === "moderate" || activityLevel === "moderee") {
        facteur = 1.55;
      } else if (activityLevel === "faible" || activityLevel === "sedentary") {
        facteur = 1.2;
      } else if (activityLevel === "elevee" || activityLevel === "active") {
        facteur = 1.725;
      }

      const metabolismeactive = metabolismebase ? facteur * metabolismebase : null;
      const difficite_calorique = rythm ? (rythm * 7700) / 7 : null;

      let calorie_regime = null;
      if (goal === "perte" || goal === "weight loss") {
        calorie_regime = metabolismeactive ? metabolismeactive - difficite_calorique : null;
      } else if (goal === "gain" || goal === "muscle gain") {
        calorie_regime = metabolismeactive ? metabolismeactive + difficite_calorique : null;
      } else {
        calorie_regime = metabolismeactive || null;
      }

      // Update the latest visit or create a new one
      const latestVisit = await PatientVisit.findOne({ patient: id })
        .sort({ visitDate: -1 });

      if (latestVisit) {
        // Update the latest visit with the new data
        if (weight) latestVisit.weight = weight;
        if (bf) latestVisit.bf = bf;
        if (healthScore) latestVisit.healthScore = healthScore;
        if (goal) latestVisit.goal = goal;
        // Update calculated fields
        latestVisit.bmi = height ? parseFloat((weight / (height / 100) ** 2).toFixed(1)) : latestVisit.bmi;
        latestVisit.basemetabolisme = metabolismebase ? parseFloat(metabolismebase.toFixed(1)) : latestVisit.basemetabolisme;
        latestVisit.activemetabolisme = metabolismeactive ? parseFloat(metabolismeactive.toFixed(1)) : latestVisit.activemetabolisme;
        latestVisit.calorieintake = calorie_regime ? parseFloat(calorie_regime.toFixed(1)) : latestVisit.calorieintake;

        await latestVisit.save();
      } else {
        // If no visit exists, create a new one
        const newVisit = new PatientVisit({
          patient: id,
          weight,
          bf,
          bmi: height ? parseFloat((weight / (height / 100) ** 2).toFixed(1)) : null,
          basemetabolisme: metabolismebase ? parseFloat(metabolismebase.toFixed(1)) : null,
          activemetabolisme: metabolismeactive ? parseFloat(metabolismeactive.toFixed(1)) : null,
          calorieintake: calorie_regime ? parseFloat(calorie_regime.toFixed(1)) : null,
          healthScore,
          rythm,
          visitDate: new Date()
        });
        await newVisit.save();
      }
    }

    // Check inactive status
    const lastVisit = await PatientVisit.findOne({ patient: id })
      .sort({ visitDate: -1 });

    if (lastVisit) {
      const daysSinceLastVisit = Math.floor(
        (Date.now() - lastVisit.visitDate) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastVisit > 21 && updatedPatient.status === 'en cours') {
        updatedPatient.status = 'inactif';
        await updatedPatient.save();
      }
    }

    res.status(200).json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// 🔹 GET all patients (with decrypted CIN)
export const getPatients = async (req, res) => {
  try {
    // Get the doctor ID from the authenticated user
    const doctorId = req.user._id;
   
    // Find only patients assigned to this doctor
    const patients = await Patient.find({ doctor: doctorId });
   
    // Get the latest visit for each patient
    const patientsWithVisits = await Promise.all(
      patients.map(async (patient) => {
        const latestVisit = await PatientVisit.findOne({ patient: patient._id })
          .sort({ visitDate: -1 })
          .populate('diet');

        return {
          ...patient.toObject(),
          latestVisit: latestVisit || null
        };
      })
    );

    res.json(patientsWithVisits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params; // Extract patient ID from URL

    // Find the patient by ID
   const patient = await Patient.findById(id).populate('doctor');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Fetch the most recent visit for the patient
    const latestVisit = await PatientVisit.find({ patient: id })
      .sort({ visitDate: -1 }).populate("diet"); // Sort by visitDate in descending order

    // Calculate the patient's age
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

    const patientData = {
      ...patient.toObject(),
      age: calculateAge(patient.dateOfBirth),
      latestVisit,
    };

    res.status(200).json(patientData);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
export const getPatientVisits = async (req, res) => {
  try {
    const visits = await PatientVisit.find({ patient: req.params.id })
      .populate('diet')
      .populate('training')
      .sort({ createdAt: 1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPatientVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, bf, healthScore, rythm, goal } = req.body;

    // Validate required fields and ranges
    if (!weight || !bf || !rythm || !goal) {
      return res.status(400).json({ 
        message: "Weight, body fat, and rhythm are required." 
      });
    }

    // Validate weight range
    if (weight < 0 || weight > 200) {
      return res.status(400).json({
        message: "Weight must be between 0 and 200 kg"
      });
    }

    // Validate body fat range
    if (bf < 0 || bf > 100) {
      return res.status(400).json({
        message: "Body fat must be between 0 and 100%"
      });
    }

    // Find and update the patient
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Update lastmeasurement
    patient.lastmeasurement = new Date();
    
    // Reset status to 'en cours' if patient was inactive
    if (patient.status === 'inactif') {
      patient.status = 'en cours';
    }

    // Calculate metabolic values
    const massemaigre = weight * (1 - (bf / 100));
    const metabolismebase = 370 + (21.6 * massemaigre);

    // Determine activity factor
    let facteur = 1.55;
    if (patient.activityLevel === "sedentary" || patient.activityLevel === "faible") {
      facteur = 1.2;
    } else if (patient.activityLevel === "active" || patient.activityLevel === "elevee") {
      facteur = 1.725;
    }

    const metabolismeactive = facteur * metabolismebase;
    const difficite_calorique = (rythm * 7700) / 7;

    // Translate goal for database storage
    const translatedGoal = 
      goal === 'perte' ? 'weight loss' :
      goal === 'gain' ? 'muscle gain' : 'maintenance';

    // Calculate calorie regime based on goal
    let calorie_regime;
    if (translatedGoal === "weight loss") {
      calorie_regime = metabolismeactive - difficite_calorique;
    } else if (translatedGoal === "muscle gain") {
      calorie_regime = metabolismeactive + difficite_calorique;
    } else {
      calorie_regime = metabolismeactive;
    }

    const newVisit = new PatientVisit({
      patient: patient._id,
      weight,
      bf,
      bmi: patient.height ? parseFloat((weight / (patient.height / 100) ** 2).toFixed(1)) : null,
      basemetabolisme: parseFloat(metabolismebase.toFixed(1)),
      activemetabolisme: parseFloat(metabolismeactive.toFixed(1)),
      calorieintake: parseFloat(calorie_regime.toFixed(1)),
      healthScore,
      rythm,
      goal: translatedGoal,
      visitDate: new Date()
    });

    await newVisit.save();
    await patient.save(); // Save the updated patient

    // Check if target is reached
    const isTargetReached = 
      (goal === 'perte' && weight <= patient.targetWeight) ||
      (goal === 'gain' && weight >= patient.targetWeight) ||
      (goal === 'maintenance' && Math.abs(weight - patient.targetWeight) <= 1);

    if (isTargetReached && patient.status !== 'reussi') {
      patient.status = 'reussi';
      await patient.save();
    }

    res.status(201).json({
      message: "Visit added successfully.",
      visit: newVisit,
      patient: await Patient.findById(id) // Get fresh patient data
    });
  } catch (error) {
    console.error('Error adding visit:', error);
    res.status(500).json({ 
      message: 'Server error.',
      error: error.message 
    });
  }
};
export const assignDietToVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { dietId } = req.body;

    const visit = await PatientVisit.findById(visitId);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found." });
    }

    visit.diet = dietId;
    await visit.save();

    res.status(200).json({ message: "Diet assigned successfully.", visit });
  } catch (error) {

    res.status(500).json({ message: "Server error." });
  }
};

export const addDietPlan = async (req, res) => {
  try {
    const { name, meals } = req.body;
    if (!name || !meals ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newDietPlan = new DietPlan({
      name,
      meals,
     
    });

    const savedDietPlan = await newDietPlan.save();

    res.status(201).json({
      message: "Diet plan added successfully.",
      dietPlan: savedDietPlan,
    });
  } catch (error) {
    
    res.status(500).json({ message: "Server error." });
  }
};

// Add a new function to check and update inactive patients
export const updateInactivePatients = async () => {
  try {
    const patients = await Patient.find({ 
      status: 'en cours',
      // Don't check abandoned patients
      status: { $nin: ['abandonne'] }
    });
    
    for (const patient of patients) {
      const lastVisit = await PatientVisit.findOne({ patient: patient._id })
        .sort({ visitDate: -1 });

      if (lastVisit) {
        const daysSinceLastVisit = Math.floor(
          (Date.now() - lastVisit.visitDate) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastVisit > 21 && patient.status === 'en cours') {
          patient.status = 'inactif';
          await patient.save();
        }

        // Check if target is reached
        const isTargetReached = 
          (patient.goal === 'weight loss' && lastVisit.weight <= patient.targetWeight) ||
          (patient.goal === 'muscle gain' && lastVisit.weight >= patient.targetWeight) ||
          (patient.goal === 'maintenance' && Math.abs(lastVisit.weight - patient.targetWeight) <= 1);

        if (isTargetReached && patient.status !== 'reussi') {
          patient.status = 'reussi';
          await patient.save();
        }
      }
    }
  } catch (error) {
    console.error('Error updating patient statuses:', error);
  }
};

// Schedule automatic status updates (add to server.js)
