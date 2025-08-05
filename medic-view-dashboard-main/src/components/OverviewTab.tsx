import {
  Scale,
  Heart,
  TrendingUp,
  Activity,
  Info,
  AlertTriangle,
  Shield,
  ChefHat,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { HealthScore } from "./HealthScore";
import { MacroProgress } from "./MacroProgress";
import { MicronutrientGrid } from "./MicronutrientGrid";
import { useState } from "react";
import { AddVisitForm } from "./AddVisitForm";
import { VisitNavigator } from "./VisitNavigator";

interface Patient {
  _id?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: "male" | "female";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  bf?: number;
  goal?: string;
  rythm?: number;
  pathalogie?: string;
  allergie?: string;
  latestVisit?: {
    weight?: number;
    bf?: number;
    rythm?: number;
    basemetabolisme?: number;
    activemetabolisme?: number;
    calorieintake?: number;
    bmi?: number;
  };
}

interface OverviewTabProps {
  language: "fr" | "en";
  patient?: Patient;
  visits?: any[]; // Add visits prop
  onVisitAdded?: () => void; // Add this prop
}

export function OverviewTab({
  language,
  patient,
  visits = [],
  onVisitAdded,
}: OverviewTabProps) {
  const [showAddVisitForm, setShowAddVisitForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(visits[visits.length - 1]);
  console.log("visits: ", visits);
  console.log("currentVisit: ", currentVisit);
  const texts = {
    fr: {
      bodyInfo: "Anthropométrie & Composition Corporelle",
      basemet: "Metabolisme de Base",
      activemet: "Metabolisme Active",
      calact: "Apport Calorique",
      bmi: "IMC ",
      bodyFat: "Masse Grasse (%)",
      healthMetrics: "Score de Santé Métabolique",
      macroNutrients: "Répartition Macronutrientaire",
      medicalInfo: "Informations Médicales",
      pathologies: "Pathologies",
      allergies: "Allergies",
      noData: "Non renseigné",
      noPathologies: "Aucune pathologie connue",
      noAllergies: "Aucune allergie connue",
      overviewSubtitle:
        "Paramètres anthropométriques et indicateurs nutritionnels",
      medicalSubtitle: "Conditions médicales et allergies importantes",
      bmiCategories: {
        underweight: "Insuffisance pondérale (< 18,5)",
        normal: "Poids normal (18,5 - 24,9)",
        overweight: "Surpoids (25,0 - 29,9)",
        obese: "Obésité (≥ 30,0)",
      },
      clinicalNotes: {
        bmiNote: "Selon classification OMS",
        muscleMassNote: "Estimation basée sur composition corporelle",
        bodyFatNote: "Mesure par impédancemétrie recommandée",
      },
      dietPlan: "Plan Alimentaire",
      noDiet: "Aucun plan alimentaire assigné",
      breakfast: "Petit Déjeuner",
      morningSnack: "Collation Matinale",
      lunch: "Déjeuner",
      afternoonSnack: "Collation Après-midi",
      dinner: "Dîner",
    },
    en: {
      bodyInfo: "Anthropometry & Body Composition",
      basemet: "Base Metabolism",
      activemet: "Active Metabolism",
      calact: "Caloric Intake",
      bmi: "BMI ",
      bodyFat: "Body Fat Percentage",
      healthMetrics: "Metabolic Health Score",
      macroNutrients: "Macronutrient Distribution",
      medicalInfo: "Medical Information",
      pathologies: "Pathologies",
      allergies: "Allergies",
      noData: "Not assessed",
      noPathologies: "No known pathologies",
      noAllergies: "No known allergies",
      overviewSubtitle: "Anthropometric parameters and nutritional indicators",
      medicalSubtitle: "Important medical conditions and allergies",
      bmiCategories: {
        underweight: "Underweight (< 18.5)",
        normal: "Normal weight (18.5 - 24.9)",
        overweight: "Overweight (25.0 - 29.9)",
        obese: "Obesity (≥ 30.0)",
      },
      clinicalNotes: {
        bmiNote: "WHO classification",
        muscleMassNote: "Estimate based on body composition",
        bodyFatNote: "Bioelectrical impedance measurement recommended",
      },
      dietPlan: "Diet Plan",
      noDiet: "No diet plan assigned",
      breakfast: "Breakfast",
      morningSnack: "Morning Snack",
      lunch: "Lunch",
      afternoonSnack: "Afternoon Snack",
      dinner: "Dinner",
    },
  };

  const t = texts[language];

  const latestVisit = patient?.latestVisit;

  const weight = latestVisit?.weight ?? patient?.weight ?? null;
  const bf = latestVisit?.bf ?? patient?.bf ?? null;
  const height = patient?.height ?? null;
  const activity = patient?.activityLevel ?? null;
  const goal = patient?.goal ?? null;
  const rythm = latestVisit?.rythm ?? patient?.rythm ?? null;

  // BMI calculation with proper validation
  const calculateBMI = (): string => {
    if (!weight || !height || weight <= 0 || height <= 0) return "--";
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
  };

  // Enhanced BMI interpretation for clinical use
  const getBMICategory = (bmiValue: string): string => {
    if (bmiValue === "--") return "";
    const bmi = parseFloat(bmiValue);
    if (bmi < 16)
      return language === "fr"
        ? "Dénutrition sévère (< 16)"
        : "Severe malnutrition (< 16)";
    if (bmi < 17)
      return language === "fr"
        ? "Dénutrition modérée (16-17)"
        : "Moderate malnutrition (16-17)";
    if (bmi < 18.5) return t.bmiCategories.underweight;
    if (bmi < 25) return t.bmiCategories.normal;
    if (bmi < 30) return t.bmiCategories.overweight;
    if (bmi < 35)
      return language === "fr"
        ? "Obésité classe I (30-35)"
        : "Class I obesity (30-35)";
    if (bmi < 40)
      return language === "fr"
        ? "Obésité classe II (35-40)"
        : "Class II obesity (35-40)";
    return language === "fr"
      ? "Obésité classe III (≥ 40)"
      : "Class III obesity (≥ 40)";
  };

  // Clinical muscle mass estimation with Boer formula approximation
  const calculateMuscleMass = (): string => {
    if (!weight || !height || !patient?.gender) return "--";

    // Simplified Boer formula for lean body mass
    let leanMass: number;
    if (patient.gender === "male") {
      leanMass = 0.407 * weight + 0.267 * height - 19.2;
    } else {
      leanMass = 0.252 * weight + 0.473 * height - 48.3;
    }

    return Math.max(0, leanMass).toFixed(1);
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const muscleMass = calculateMuscleMass();

  // Clinical color coding for BMI assessment
  const getBMIColor = (bmiValue: string): string => {
    if (bmiValue === "--") return "gray";
    const bmiNum = parseFloat(bmiValue);
    if (bmiNum < 16) return "red"; // Severe malnutrition
    if (bmiNum < 18.5) return "orange"; // Underweight
    if (bmiNum < 25) return "green"; // Normal
    if (bmiNum < 30) return "yellow"; // Overweight
    if (bmiNum < 35) return "orange"; // Class I obesity
    return "red"; // Class II-III obesity
  };

  const handleAddVisit = async (visitData: {
    weight: number;
    bf: number;
    healthScore: number;
    rythm: number;
    dietId?: string | null;
  }) => {
    if (!patient?._id) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/patients/${patient._id}/visits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(visitData),
        }
      );

      const responseData = await response.json();
      console.log("Visit added:", responseData);
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add visit");
      }

      // Notify the parent component to refresh patient data
      if (onVisitAdded) {
        onVisitAdded();
      }

      setShowAddVisitForm(false);
    } catch (error) {
      console.error("Error adding visit:", error);
      alert(error.message || "Failed to add visit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAddVisitForm) {
    return (
      <AddVisitForm
        patientId={patient?._id || ""}
        onSubmit={handleAddVisit}
        onCancel={() => setShowAddVisitForm(false)}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t.bodyInfo}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t.overviewSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddVisitForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Add Visit
          </button>
        </div>

        {/* Body Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <MetricCard
            title={t.basemet}
            value={currentVisit?.basemetabolisme ?? t.noData}
            unit="kcal"
            color="blue"
            icon={<Scale className="h-6 w-6" />}
          />

          <MetricCard
            title={t.activemet}
            value={currentVisit?.activemetabolisme ?? t.noData}
            unit="kcal"
            color="teal"
            icon={<Activity className="h-6 w-6" />}
          />

          <MetricCard
            title={t.calact}
            value={currentVisit?.calorieintake ?? t.noData}
            unit="kcal"
            color="red"
            icon={<TrendingUp className="h-6 w-6" />}
          />

          <MetricCard
            title={t.bmi}
            value={currentVisit?.bmi ?? t.noData}
            color={getBMIColor(bmi)}
            icon={<TrendingUp className="h-6 w-6" />}
            subtitle={bmiCategory || t.noData}
            clinicalNote={t.clinicalNotes.bmiNote}
          />

          <MetricCard
            title={t.bodyFat}
            value={currentVisit?.bf ?? t.noData}
            unit="%"
            color="orange"
            icon={<Heart className="h-6 w-6" />}
            subtitle={bf ? `${bf}%` : t.noData}
            clinicalNote={t.clinicalNotes.bodyFatNote}
          />
        </div>
      </div>

      {/* Visit Navigator */}
      {visits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <VisitNavigator
            visits={visits}
            language={language}
            onVisitChange={setCurrentVisit}
          />
        </div>
      )}

      {/* Medical Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.medicalInfo}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t.medicalSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pathologies */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t.pathologies}
              </h3>
            </div>
            <div className="min-h-[100px]">
              {patient?.pathalogie ? (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-3">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {patient.pathalogie}
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-3">
                  <p className="text-green-700 dark:text-green-300 italic">
                    {t.noPathologies}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t.allergies}
              </h3>
            </div>
            <div className="min-h-[100px]">
              {patient?.allergie ? (
                <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-md p-3">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {patient.allergie}
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-3">
                  <p className="text-green-700 dark:text-green-300 italic">
                    {t.noAllergies}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics Section */}
      <div className="xl:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.healthMetrics}
            </h3>
          </div>
          <HealthScore
            score={currentVisit?.healthScore ?? 0} // Dynamically use healthScore
            language={language}
            className="h-full"
          />
        </div>
      </div>

      {/* Diet Plan Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl shadow-inner">
            <ChefHat className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t.dietPlan}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your personalized nutrition guide
            </p>
          </div>
        </div>

        {currentVisit?.diet ? (
          <div className="space-y-8">
            {(() => {
              // Group meals by day
              const dayMeals: Record<string, Record<string, string>> = {};
              Object.entries(currentVisit.diet.meals).forEach(
                ([mealType, details]) => {
                  details
                    .split("\n")
                    .filter((line) => line.trim() !== "") // Remove empty lines
                    .forEach((line) => {
                      const [day, meal] = line.split(": ");
                      if (day && meal) {
                        dayMeals[day.trim()] = dayMeals[day.trim()] || {};
                        dayMeals[day.trim()][mealType] = meal.trim();
                      }
                    });
                }
              );

              return Object.entries(dayMeals).map(([day, meals]) => (
                <div
                  key={day}
                  className="group relative bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border border-gray-200/60 dark:border-gray-700/60 hover:shadow-md hover:border-green-300/50 dark:hover:border-green-600/50 transition-all duration-300"
                >
                  {/* Day header with decorative line */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      {day}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 dark:to-transparent"></div>
                  </div>

                  {/* Meals grid */}
                  <div className="grid gap-4">
                    {Object.entries(meals).map(([mealType, meal]) => (
                      <div
                        key={mealType}
                        className="flex flex-col sm:flex-row sm:items-start gap-2 p-4 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-900/80 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2 sm:min-w-[120px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
                            {t[mealType as keyof typeof t]}
                          </span>
                        </div>
                        <div className="flex-1 sm:ml-2">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {meal}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <ChefHat className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 italic text-lg font-medium">
              {t.noDiet}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Your diet plan will appear here once available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
