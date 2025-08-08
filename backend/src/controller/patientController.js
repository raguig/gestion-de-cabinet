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
      bf, // Body Fat
      healthScore, // Health Score
      activityLevel,
      goal,
      rythm,
      lastmeasurement,
      pathalogie,
      allergie
    } = req.body;

    if (!firstname || !lastname || !sex || !dateOfBirth || !weight || !height || !activityLevel || !goal || !rythm || !lastmeasurement) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const doctorId = req.user._id; // Get doctor ID from authenticated user

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
       doctor: doctorId, // Assign the doctor ID
    });

   const savedPatient = await newPatient.save();
    const massemaigre=weight*(1-(bf/100));
    const metabolismebase=370+(21.6*massemaigre)
    let facteur = 1.55;
  if (activityLevel == "moderate" || activityLevel == "moderee") {
    facteur = 1.55;
  } else if (activityLevel == "faible" || activityLevel == "sedentary") {
    facteur = 1.2;
  } else {
    facteur = 1.725;
  }
  let metabolismeactive=facteur*metabolismebase;

  const difficite_calorique = (rythm * 7700) / 7;
  let calorie_regime;
  if (goal == "perte" || goal == "weight loss") {
    calorie_regime = metabolismeactive - difficite_calorique;
  } else if (goal == "gain" || goal == "muscle gain") {
    calorie_regime = metabolismeactive + difficite_calorique;
  } else {
    calorie_regime = metabolismeactive + 0;
  }
    // Create the initial visit
    const initialVisit = new PatientVisit({
      patient: savedPatient._id,
      weight,
      bf,
      bmi: height ? parseFloat((weight / (height / 100) ** 2).toFixed(1)) : null,
      basemetabolisme: parseFloat(metabolismebase.toFixed(1)),
      activemetabolisme: parseFloat(metabolismeactive.toFixed(1)),
      calorieintake: parseFloat(calorie_regime.toFixed(1)),
      healthScore,
      rythm,
      goal: goal,
    });

    await initialVisit.save();

    res.status(201).json({
      message: 'Patient and initial visit added successfully.',
      patient: savedPatient,
      visit: initialVisit,
    });
  } catch (error) {
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

    // Update the patient
    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, { new: true });

    // If weight, bf, activityLevel, goal, or rythm is included in the update, recalculate formulas
    const { weight, bf, activityLevel, goal, rythm, healthScore } = updateData;
    if (weight || bf || activityLevel || goal || rythm) {
      const height = updatedPatient.height; // Use the updated height if available
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
      const latestVisit = await PatientVisit.findOne({ patient: id }).sort({ visitDate: -1 });

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
          
        });
        await newVisit.save();
      }
    }

    res.status(200).json({ message: "Patient updated successfully.", updatedPatient });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
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
    const patient = await Patient.findById(id);
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

    // Validate required fields
    if (!weight || !bf || !healthScore || !rythm || !goal) {
      return res.status(400).json({ message: "Weight, body fat, health score, and rythm are required." });
    }

    // Find the patient by ID
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Calculate lean mass (masse maigre)
    const massemaigre = weight * (1 - bf / 100);
    const metabolismebase = 370 + 21.6 * massemaigre;

    // Determine activity factor based on patient's activity level
    let facteur = 1.55;
    if (patient.activityLevel === "moderate" || patient.activityLevel === "moderee") {
      facteur = 1.55;
    } else if (patient.activityLevel === "faible" || patient.activityLevel === "sedentary") {
      facteur = 1.2;
    } else {
      facteur = 1.725;
    }

    const metabolismeactive = facteur * metabolismebase;
    const difficite_calorique = (rythm * 7700) / 7;

    let calorie_regime = metabolismeactive;
    if (goal === "perte" || goal === "weight loss") {
      calorie_regime = metabolismeactive - difficite_calorique;
    } else if (goal === "gain" || goal === "muscle gain") {
      calorie_regime = metabolismeactive + difficite_calorique;
    }else{
      calorie_regime = metabolismeactive + 0;
    }

    const bmi = patient.height ? parseFloat((weight / (patient.height / 100) ** 2).toFixed(1)) : null;

    // Create a new visit
    const newVisit = new PatientVisit({
      patient: patient._id,
      weight,
      bf,
      bmi,
      basemetabolisme: parseFloat(metabolismebase.toFixed(1)),
      activemetabolisme: parseFloat(metabolismeactive.toFixed(1)),
      calorieintake: parseFloat(calorie_regime.toFixed(1)),
      healthScore,
      rythm,
      goal: goal,
    });

    await newVisit.save();

    // Fetch the updated latest visit
    const latestVisit = await PatientVisit.findOne({ patient: id })
      .sort({ visitDate: -1 })
      .populate("diet"); // Populate the diet details

    res.status(201).json({
      message: "Visit added successfully.",
      latestVisit, // Return the updated latest visit
    });
  } catch (error) {
    
    res.status(500).json({ message: "Server error." });
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