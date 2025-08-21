import Patient from '../models/Patient.js';
import PatientVisit from '../models/PatientVisit.js';
import DietPlan from '../models/DietPlan.js';
import CustomFood from '../models/CustomFood.js';
import mongoose from 'mongoose';

export const MealPlannerController = {
  // Get all patients for a doctor with their latest visit info
  async getDoctorPatients(req, res) {
    try {
      // Convert string ID to ObjectId
      const doctorId = new mongoose.Types.ObjectId(req.user._id);
      console.log('Fetching patients for doctor:', doctorId);

      const patients = await Patient.aggregate([
        { 
          $match: { 
            doctor: doctorId 
          }
        },
        {
          $lookup: {
            from: 'patientvisits',
            let: { patientId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { 
                    $eq: ['$patient', '$$patientId']
                  }
                }
              },
              { $sort: { visitDate: -1 } },
              { $limit: 1 }
            ],
            as: 'latestVisit'
          }
        },
        {
          $unwind: {
            path: '$latestVisit',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'dietplans',
            let: { dietId: '$latestVisit.diet' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$dietId'] }
                }
              }
            ],
            as: 'dietPlan'
          }
        },
        {
          $unwind: {
            path: '$dietPlan',
            preserveNullAndEmptyArrays: true
          }
        }
      ]);

      console.log(`Found ${patients.length} patients`);
      res.json(patients);

    } catch (error) {
      console.error('Error in getDoctorPatients:', error);
      res.status(500).json({ 
        message: 'Error fetching patients',
        error: error.message 
      });
    }
  },

  // Get a specific patient's meal plan
 // Update the getPatientMealPlan function
async getPatientMealPlan(req, res) {
  try {
    const patientId = new mongoose.Types.ObjectId(req.params.patientId);
    const doctorId = new mongoose.Types.ObjectId(req.user._id);

    // Get latest visit with populated diet plan
    const latestVisit = await PatientVisit.findOne({ patient: patientId })
      .sort({ visitDate: -1 })
      .populate('diet') // Populate the diet reference
      .lean();

    if (!latestVisit) {
      return res.json({ message: 'No visits found' });
    }

    res.json({
      latestVisit,
      dietPlan: latestVisit.diet
    });

  } catch (error) {
    console.error('Error in getPatientMealPlan:', error);
    res.status(500).json({ 
      message: 'Error fetching meal plan',
      error: error.message
    });
  }
},

  // Save or update a patient's diet plan
  async saveDietPlan(req, res) {
    try {
      const { patientId, meals } = req.body;
      const doctorId = new mongoose.Types.ObjectId(req.user._id);

      // Verify patient belongs to doctor
      const patient = await Patient.findOne({
        _id: patientId,
        doctor: doctorId
      });

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      // Create new diet plan
      const dietPlan = await DietPlan.create({
        name: `Diet Plan - ${new Date().toLocaleDateString()}`,
        meals: {
          breakfast: meals.breakfast,
          lunch: meals.lunch,
          dinner: meals.dinner,
          morningSnack: meals.morningSnack,
          afternoonSnack: meals.afternoonSnack
        }
      });

      // Update latest visit with new diet
      await PatientVisit.findOneAndUpdate(
        { patient: patientId },
        { diet: dietPlan._id },
        { sort: { visitDate: -1 } }
      );

      res.json({ 
        message: 'Diet plan saved successfully',
        dietPlan 
      });

    } catch (error) {
      console.error('Error in saveDietPlan:', error);
      res.status(500).json({ 
        message: 'Error saving diet plan',
        error: error.message
      });
    }
  },

  // Get all custom foods for a doctor
  async getDoctorCustomFoods(req, res) {
    try {
      const doctorId = req.user._id; // From auth middleware
      const customFoods = await CustomFood.find({ doctorId });
      res.json(customFoods);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add a new custom food
  async addCustomFood(req, res) {
    try {
      const doctorId = req.user._id; // From auth middleware
      const customFood = new CustomFood({
        ...req.body,
        doctorId
      });
      
      const savedFood = await customFood.save();
      res.status(201).json(savedFood);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a custom food
  async deleteCustomFood(req, res) {
    try {
      const doctorId = req.user._id;
      const foodId = req.params.id;
      
      const food = await CustomFood.findOne({ _id: foodId, doctorId });
      if (!food) {
        return res.status(404).json({ message: 'Food not found or unauthorized' });
      }
      
      await food.remove();
      res.json({ message: 'Food deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};