import { GoogleGenerativeAI } from "@google/generative-ai";
import csv from 'csv-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Patient from "../models/Patient.js";
import PatientVisit from "../models/PatientVisit.js";

dotenv.config();

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load CSV data
const loadMoroccanFoods = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, '../../data/nutrition_maroc.csv');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      reject(new Error(`CSV file not found at: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log('CSV data loaded:', results.length, 'items');
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
};

export const generateDiet = async (req, res) => {
  try {
    const {
      weight,
      height,
      goal,
      favoriteFood,
      allergies,
      notes,
      language = 'fr' // Add language parameter with French as default
    } = req.body;

    // Load Moroccan foods data
    const moroccanFoods = await loadMoroccanFoods();
    console.log('Moroccan foods loaded:', moroccanFoods.length, 'items');
    // Calculate BMI
    const heightInM = height / 100;
    const bmi = (weight / (heightInM * heightInM)).toFixed(1);

    // Calculate recommended daily calories based on BMI and goal
    const calculateRecommendedCalories = (weight, height, goal) => {
      const bmr = 10 * weight + 6.25 * height - 5 * 30 + 5; // Basic BMR formula
      const activityFactor = 1.2; // Sedentary activity level
      let calories = bmr * activityFactor;
      
      switch(goal) {
        case 'lose':
          calories -= 500; // Deficit for weight loss
          break;
        case 'gain':
          calories += 500; // Surplus for weight gain
          break;
      }
      return Math.round(calories);
    };

    const recommendedCalories = calculateRecommendedCalories(weight, height, goal);

    // Update prompt based on language
    const prompt = language === 'fr' ? 
      `En tant qu'expert en nutrition marocaine, analysez les données du patient et créez un régime alimentaire personnalisé:

      Informations patient:
      - Poids: ${weight}kg
      - Taille: ${height}cm
      - IMC: ${bmi}
      - Objectif: ${goal === 'lose' ? 'Perte de poids' : goal === 'gain' ? 'Prise de poids' : 'Maintien du poids'}
      - Calories recommandées: ${recommendedCalories}kcal/jour
      - Allergies: ${allergies || 'Aucune'}
      - Notes: ${notes || 'Aucune'}` :
      
      `As a Moroccan nutrition expert, analyze the patient's data and create a personalized diet plan:

      Patient information:
      - Weight: ${weight}kg
      - Height: ${height}cm
      - BMI: ${bmi}
      - Goal: ${goal === 'lose' ? 'Weight loss' : goal === 'gain' ? 'Weight gain' : 'Weight maintenance'}
      - Recommended calories: ${recommendedCalories}kcal/day
      - Allergies: ${allergies || 'None'}
      - Notes: ${notes || 'None'}`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Send response with language-specific formatting
    res.status(200).json({
      success: true,
      analysis: response.text(),
      recommendations: {
        bmi,
        bmr: calculateRecommendedCalories(weight, height, goal),
        targetCalories: recommendedCalories,
        goalMessage: language === 'fr' 
          ? (goal === 'lose' ? 'perte de poids' : goal === 'gain' ? 'prise de poids' : 'maintien du poids')
          : (goal === 'lose' ? 'weight loss' : goal === 'gain' ? 'weight gain' : 'weight maintenance'),
        macros: {
          protein: Math.round((recommendedCalories * 0.25) / 4),
          carbs: Math.round((recommendedCalories * 0.45) / 4),
          fats: Math.round((recommendedCalories * 0.3) / 9),
        }
      }
    });

  } catch (error) {
    console.error('Error generating diet:', error);
    res.status(500).json({
      success: false,
      message: language === 'fr' 
        ? "Erreur lors de la génération du régime alimentaire"
        : "Error generating diet plan",
      error: error.message,
    });
  }
};


// ...existing code...

export const getPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patients = await Patient.find({ doctor: doctorId });

    // For each patient, get the latest visit and required fields
    const result = await Promise.all(
      patients.map(async (patient) => {
        const latestVisit = await PatientVisit.findOne({ patient: patient._id })
          .sort({ visitDate: -1 });

        // Calculate age
        const birth = new Date(patient.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }

        return {
          _id: patient._id,
          firstname: patient.firstname,
          lastname: patient.lastname,
          sex: patient.sex,
          age,
          height: patient.height,
          latestVisit: latestVisit
            ? {
                bmi: latestVisit.bmi,
                weight: latestVisit.weight,
                calorieintake: latestVisit.calorieintake,
                rythm: latestVisit.rythm,
                goal: latestVisit.goal,
              }
            : null,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};