import { useState, useEffect } from "react";
import dietPlansData from "../../public/diet-plans.json"; // Adjust the path if necessary
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Coffee,
  Apple,
  Utensils,
  Cookie,
  ChefHat,
  Plus,
  Save,
  Edit2,
  Trash2,
  Download,
  Check,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import axios from "axios";

interface DietEditorSlideProps {
  language: "fr" | "en";
  calorieintake?: number;
  visitId: string;
  onDietAssigned?: () => void;
  patient?: any; // Add this prop
}

interface Meal {
  name: string;
  details: string;
  calories: number;
}

interface DietPlan {
  id: string;
  meals: {
    breakfast: Meal;
    morningSnack: Meal;
    lunch: Meal;
    afternoonSnack: Meal;
    dinner: Meal;
  };
  totalCalories?: number;
  macros?: { proteins: number; carbs: number; fats: number };
  benefits?: string[];
  notes?: string;
}

interface DietVersion {
  id: string;
  name: string;
  selectedDays: string[];
}

interface NewDietForm {
  name: string;
  meals: {
    breakfast: string;
    morningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
  };
}

export function DietEditorSlide({
  language,
  calorieintake,
  visitId,
  onDietAssigned,
  patient,
}: DietEditorSlideProps) {
  const [versions, setVersions] = useState<DietVersion[]>([
    { id: "v1", name: "Équilibré", selectedDays: ["J1", "J3", "J7"] },
    { id: "v2", name: "Intensif", selectedDays: ["J1", "J3", "J5", "J7"] },
  ]);
  const [selectedVersion, setSelectedVersion] = useState<string>("v1");
  const [newVersionName, setNewVersionName] = useState("");
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{
    dayId: string;
    mealType: string;
  } | null>(null);
  const [editedDietPlans, setEditedDietPlans] = useState<
    Record<string, DietPlan>
  >({});
  const [dietPlans, setDietPlans] = useState<Record<string, DietPlan>>({});
  const [isAddingDiet, setIsAddingDiet] = useState(false);
  const [newDietForm, setNewDietForm] = useState<NewDietForm>({
    name: "",
    meals: {
      breakfast: "",
      morningSnack: "",
      lunch: "",
      afternoonSnack: "",
      dinner: "",
    },
  });

  const texts = {
    fr: {
      versions: "Versions de régime",
      createVersion: "Créer une version",
      newVersionName: "Nom de la nouvelle version",
      saveVersion: "Sauvegarder",
      cancel: "Annuler",
      dayPlans: "Plans journaliers disponibles",
      selectedForVersion: "Sélectionné pour cette version",
      breakfast: "Petit Déjeuner",
      morningSnack: "Collation Matinale",
      lunch: "Déjeuner",
      afternoonSnack: "Collation Après-midi",
      dinner: "Dîner",
      totalCalories: "Total Calories",
      macros: "Répartition Macros",
      proteins: "Protéines",
      carbs: "Glucides",
      fats: "Lipides",
      benefits: "Bénéfices de ce jour",
      notes: "Notes du nutritionniste",
      assignToPatient: "Assigner au patient",
      downloadPdf: "Télécharger PDF",
      kcal: "kcal",
      addDiet: "Ajouter un régime",
      selectAndAssign: "Sélectionner et assigner",
      noDetailsAvailable: "Aucun détail disponible",
      viewDayDetails: "Voir les détails du jour",
      dietName: "Nom du régime",
      saveAndAssign: "Sauvegarder et assigner",
    },
    en: {
      versions: "Diet versions",
      createVersion: "Create version",
      newVersionName: "New version name",
      saveVersion: "Save",
      cancel: "Cancel",
      dayPlans: "Available daily plans",
      selectedForVersion: "Selected for this version",
      breakfast: "Breakfast",
      morningSnack: "Morning Snack",
      lunch: "Lunch",
      afternoonSnack: "Afternoon Snack",
      dinner: "Dinner",
      totalCalories: "Total Calories",
      macros: "Macro Distribution",
      proteins: "Proteins",
      carbs: "Carbs",
      fats: "Fats",
      benefits: "Benefits of this day",
      notes: "Nutritionist notes",
      assignToPatient: "Assign to Patient",
      downloadPdf: "Download PDF",
      kcal: "kcal",
      addDiet: "Add Diet",
      selectAndAssign: "Select and Assign",
      noDetailsAvailable: "No details available",
      viewDayDetails: "View day details",
      dietName: "Diet Name",
      saveAndAssign: "Save and Assign",
    },
  };

  const t = texts[language];

  // Function to convert array of meal items to a formatted string
  const formatMealDetails = (mealItems: any[]): string => {
    if (!Array.isArray(mealItems)) return "";
    return mealItems
      .map((item) => `${item.name} (${item.amount}${item.unit})`)
      .join(" + ");
  };

  // Function to calculate total calories for a meal
  const calculateMealCalories = (mealItems: any[]): number => {
    if (!Array.isArray(mealItems)) return 0;
    return mealItems.reduce((total, item) => total + (item.calories || 0), 0);
  };

  // Function to get meal name from items
  const getMealName = (mealType: string, mealItems: any[]): string => {
    if (!Array.isArray(mealItems) || mealItems.length === 0) {
      return t[mealType as keyof typeof t] || mealType;
    }
    // Use the first item's name or create a descriptive name
    return mealItems.length === 1
      ? mealItems[0].name
      : `${mealItems[0].name} et ${mealItems.length - 1} autre${
          mealItems.length > 2 ? "s" : ""
        }`;
  };

  useEffect(() => {
    if (!calorieintake) return;

    const calorieKeys = Object.keys(dietPlansData)
      .map((key) => parseInt(key.replace("_kcal", ""), 10))
      .filter((num) => !isNaN(num));

    const closestKey = calorieKeys.reduce((prev, curr) =>
      Math.abs(curr - calorieintake) < Math.abs(prev - calorieintake)
        ? curr
        : prev
    );

    const calorieKey = `${closestKey}_kcal`;
    const selectedPlan =
      dietPlansData[calorieKey as keyof typeof dietPlansData] || [];

    const formattedPlans: Record<string, DietPlan> = {};

    selectedPlan.forEach((dayPlan: any) => {
      if (dayPlan.day) {
        // Map French meal names to English keys for consistency
        const mealMapping = {
          "Petit-déjeuner": "breakfast",
          "Collation-matin": "morningSnack",
          Déjeuner: "lunch",
          Collation: "afternoonSnack",
          Dîner: "dinner",
        };

        const formattedMeals = {
          breakfast: {
            name: getMealName("breakfast", dayPlan.meals?.breakfast || []),
            details: formatMealDetails(
              dayPlan.meals?.["Petit-déjeuner"] ||
                dayPlan.meals?.breakfast ||
                []
            ),
            calories: calculateMealCalories(dayPlan.meals?.breakfast || []),
          },
          morningSnack: {
            name: getMealName(
              "morningSnack",
              dayPlan.meals?.morningSnack || []
            ),
            details: formatMealDetails(
              dayPlan.meals?.["Collation-matin"] ||
                dayPlan.meals?.morningSnack ||
                []
            ),
            calories: calculateMealCalories(dayPlan.meals?.morningSnack || []),
          },
          lunch: {
            name: getMealName("lunch", dayPlan.meals?.lunch || []),
            details: formatMealDetails(
              dayPlan.meals?.Déjeuner || dayPlan.meals?.lunch || []
            ),
            calories: calculateMealCalories(dayPlan.meals?.lunch || []),
          },
          afternoonSnack: {
            name: getMealName(
              "afternoonSnack",
              dayPlan.meals?.afternoonSnack || []
            ),
            details: formatMealDetails(
              dayPlan.meals?.Collation || dayPlan.meals?.afternoonSnack || []
            ),
            calories: calculateMealCalories(
              dayPlan.meals?.afternoonSnack || []
            ),
          },
          dinner: {
            name: getMealName("dinner", dayPlan.meals?.dinner || []),
            details: formatMealDetails(
              dayPlan.meals?.Dîner || dayPlan.meals?.dinner || []
            ),
            calories: calculateMealCalories(dayPlan.meals?.dinner || []),
          },
        };

        const totalCalories = Object.values(formattedMeals).reduce(
          (total, meal) => total + meal.calories,
          0
        );

        formattedPlans[dayPlan.day] = {
          id: dayPlan.day,
          meals: formattedMeals,
          totalCalories: totalCalories || closestKey,
          macros: dayPlan.macros || { proteins: 0, carbs: 0, fats: 0 },
          benefits: dayPlan.benefits || [],
          notes: dayPlan.notes || "",
        };
      }
    });

    setDietPlans(formattedPlans);
  }, [calorieintake, t]);

  const allDays = ["J1", "J2", "J3", "J4", "J5", "J6", "J7"];

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return <Coffee className="h-4 w-4" />;
      case "morningSnack":
        return <Apple className="h-4 w-4" />;
      case "lunch":
        return <Utensils className="h-4 w-4" />;
      case "afternoonSnack":
        return <Cookie className="h-4 w-4" />;
      case "dinner":
        return <ChefHat className="h-4 w-4" />;
      default:
        return <Utensils className="h-4 w-4" />;
    }
  };

  const handleCreateVersion = () => {
    if (newVersionName.trim()) {
      const newVersion: DietVersion = {
        id: `v${versions.length + 1}`,
        name: newVersionName,
        selectedDays: [],
      };
      setVersions([...versions, newVersion]);
      setSelectedVersion(newVersion.id);
      setNewVersionName("");
      setIsCreatingVersion(false);
    }
  };

  const handleDaySelectionForVersion = (dayId: string, checked: boolean) => {
    setVersions(
      versions.map((version) =>
        version.id === selectedVersion
          ? {
              ...version,
              selectedDays: checked
                ? [...version.selectedDays, dayId]
                : version.selectedDays.filter((d) => d !== dayId),
            }
          : version
      )
    );
  };

  const handleDeleteVersion = (versionId: string) => {
    const newVersions = versions.filter((v) => v.id !== versionId);
    setVersions(newVersions);
    if (selectedVersion === versionId && newVersions.length > 0) {
      setSelectedVersion(newVersions[0].id);
    }
  };

  const getCurrentDietPlan = (dayId: string): DietPlan => {
    const plan = editedDietPlans[dayId] || dietPlans[dayId];
    console.log(plan)
    if (!plan) {
      return {
        id: dayId,
        meals: {
          breakfast: { name: "", details: "", calories: 0 },
          morningSnack: { name: "", details: "", calories: 0 },
          lunch: { name: "", details: "", calories: 0 },
          afternoonSnack: { name: "", details: "", calories: 0 },
          dinner: { name: "", details: "", calories: 0 },
        },
        totalCalories: 0,
        macros: { proteins: 0, carbs: 0, fats: 0 },
        benefits: [],
        notes: "",
      };
    }
    return plan;
  };

  const handleMealEdit = (
    dayId: string,
    mealType: string,
    field: "name" | "details",
    value: string
  ) => {
    const currentPlan = getCurrentDietPlan(dayId);
    const updatedPlan = {
      ...currentPlan,
      meals: {
        ...currentPlan.meals,
        [mealType]: {
          ...currentPlan.meals[mealType as keyof typeof currentPlan.meals],
          [field]: value,
        },
      },
    };
    setEditedDietPlans((prev) => ({
      ...prev,
      [dayId]: updatedPlan,
    }));
  };

  const handleSaveMealEdit = () => {
    setEditingMeal(null);
  };

  const handleCancelMealEdit = () => {
    setEditingMeal(null);
  };

  const handleSelectSingleMeal = async (dayId: string, mealType: string) => {
    try {
      const token = localStorage.getItem("token");
      const plan = getCurrentDietPlan(dayId);
      const meal = plan.meals[mealType as keyof typeof plan.meals];

      // Create a diet with only the selected meal
      const dietData = {
        name: `${plan.id} - ${t[mealType as keyof typeof t]}`,
        meals: {
          breakfast: mealType === "breakfast" ? meal.details : "",
          morningSnack: mealType === "morningSnack" ? meal.details : "",
          lunch: mealType === "lunch" ? meal.details : "",
          afternoonSnack: mealType === "afternoonSnack" ? meal.details : "",
          dinner: mealType === "dinner" ? meal.details : "",
        },
      };

      const addDietResponse = await axios.post(
        "http://localhost:8000/api/patients/diets",
        dietData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdDiet = addDietResponse.data.dietPlan;
      console.log("visitid: ", visitId);
      // Assign the diet to the visit
      await axios.put(
        `http://localhost:8000/api/patients/visits/${visitId}/assign-diet`,
        { dietId: createdDiet._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        `${t[mealType as keyof typeof t]} diet added and assigned successfully!`
      );
      if (onDietAssigned) {
        onDietAssigned(); // Call the refresh function
      }
    } catch (error) {
      console.error("Error adding and assigning diet:", error);
      alert("Failed to add and assign diet.");
    }
  };

  const handleAssignSelectedDays = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentVersion = versions.find((v) => v.id === selectedVersion);

      if (!currentVersion || currentVersion.selectedDays.length === 0) {
        alert("Please select at least one day to assign.");
        return;
      }

      // Create a comprehensive diet plan with all selected days
      const selectedDaysData = currentVersion.selectedDays.map((dayId) => {
        const plan = getCurrentDietPlan(dayId);
        return {
          day: dayId,
          ...plan,
        };
      });

      // Create a combined meal plan
      const combinedMeals = {
        breakfast: selectedDaysData
          .map((day) => `${day.day}: ${day.meals.breakfast.details}`)
          .filter((meal) => meal.split(": ")[1])
          .join("\n\n"),
        morningSnack: selectedDaysData
          .map((day) => `${day.day}: ${day.meals.morningSnack.details}`)
          .filter((meal) => meal.split(": ")[1])
          .join("\n\n"),
        lunch: selectedDaysData
          .map((day) => `${day.day}: ${day.meals.lunch.details}`)
          .filter((meal) => meal.split(": ")[1])
          .join("\n\n"),
        afternoonSnack: selectedDaysData
          .map((day) => `${day.day}: ${day.meals.afternoonSnack.details}`)
          .filter((meal) => meal.split(": ")[1])
          .join("\n\n"),
        dinner: selectedDaysData
          .map((day) => `${day.day}: ${day.meals.dinner.details}`)
          .filter((meal) => meal.split(": ")[1])
          .join("\n\n"),
      };

      const dietData = {
        name: `${currentVersion.name} - ${currentVersion.selectedDays.join(
          ", "
        )}`,
        meals: combinedMeals,
      };
      console.log("Diet Data to be sent:", dietData);
      const addDietResponse = await axios.post(
        "http://localhost:8000/api/patients/diets",
        dietData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdDiet = addDietResponse.data.dietPlan;
      console.log("visit id " + visitId);
      // Assign the diet to the visit
      await axios.put(
        `http://localhost:8000/api/patients/visits/${visitId}/assign-diet`,
        { dietId: createdDiet._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Diet plan assigned successfully!");
      if (onDietAssigned) {
        onDietAssigned(); // Call the refresh function
      }
    } catch (error) {
      console.error("Error assigning diet:", error);
      alert("Failed to assign diet.");
    }
  };

  const handleAddCustomDiet = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!newDietForm.name.trim()) {
        alert("Please enter a diet name.");
        return;
      }

      const addDietResponse = await axios.post(
        "http://localhost:8000/api/patients/diets",
        newDietForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdDiet = addDietResponse.data.dietPlan;

      // Assign the diet to the visit
      await axios.put(
        `http://localhost:8000/api/patients/visits/${visitId}/assign-diet`,
        { dietId: createdDiet._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Custom diet added and assigned successfully!");
      setIsAddingDiet(false);
      setNewDietForm({
        name: "",
        meals: {
          breakfast: "",
          morningSnack: "",
          lunch: "",
          afternoonSnack: "",
          dinner: "",
        },
      });
    } catch (error) {
      console.error("Error adding custom diet:", error);
      alert("Failed to add custom diet.");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const version = versions.find((v) => v.id === selectedVersion);
    if (!version || version.selectedDays.length === 0) return;
    console.log(patient);
    // Use actual patient info
    const patientInfo = {
      name: `${patient?.firstname} ${patient?.lastname}`,
      age: patient?.age || "--",
      weight: patient?.latestVisit[0]?.weight
        ? `${patient.latestVisit[0].weight} kg`
        : "--",
      height: patient?.height ? `${patient.height} cm` : "--",
      bmi: patient?.latestVisit[0]?.bmi
        ? patient.latestVisit[0].bmi.toFixed(1)
        : "--",
      calorieintake: patient?.latestVisit[0]?.calorieintake
        ? `${patient.latestVisit[0].calorieintake.toFixed(0)} kcal`
        : "--",
      date: new Date().toLocaleDateString(
        language === "fr" ? "fr-FR" : "en-US"
      ),
    };

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // Enhanced colors
    const colors = {
      primary: [41, 128, 185], // Nice blue
      secondary: [46, 204, 113], // Green
      accent: [230, 126, 34], // Orange
      text: [44, 62, 80], // Dark blue-grey
      lightGray: [236, 240, 241], // Light gray
      white: [255, 255, 255],
      headerBg: [52, 152, 219], // Bright blue
    };

    // Enhanced Header with Logo/Design
    const drawHeader = () => {
      // Header background with gradient effect
      doc.setFillColor(...colors.headerBg);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Add subtle design element
      doc.setFillColor(...colors.accent);
      doc.circle(pageWidth - 20, 20, 15, "F");

      doc.setFontSize(24);
      doc.setTextColor(...colors.white);
      doc.setFont("helvetica", "bold");
      const title =
        language === "fr" ? "PLAN NUTRITIONNEL" : "NUTRITIONAL PLAN";
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 25);
    };

    // Enhanced Patient Info Section
    const drawPatientInfo = () => {
      const infoX = margin;
      let infoY = 50;

      // Info box background
      doc.setFillColor(...colors.lightGray);
      doc.roundedRect(
        margin - 5,
        45,
        pageWidth - 2 * margin + 10,
        50,
        3,
        3,
        "F"
      );

      // Title
      doc.setFontSize(14);
      doc.setTextColor(...colors.primary);
      doc.setFont("helvetica", "bold");
      doc.text(
        language === "fr" ? "INFORMATIONS PATIENT" : "PATIENT INFORMATION",
        infoX,
        infoY
      );

      // Patient details in two columns
      infoY += 10;
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);

      const leftColumn = [
        [`${language === "fr" ? "Nom:" : "Name:"} ${patientInfo.name}`],
        [
          `${language === "fr" ? "Âge:" : "Age:"} ${patientInfo.age} ${
            language === "fr" ? "ans" : "years"
          }`,
        ],
        [`${language === "fr" ? "Taille:" : "Height:"} ${patientInfo.height}`],
      ];

      const rightColumn = [
        [`${language === "fr" ? "Poids:" : "Weight:"} ${patientInfo.weight}`],
        [`${language === "fr" ? "IMC:" : "BMI:"} ${patientInfo.bmi}`],
        [
          `${language === "fr" ? "Calories:" : "Calories:"} ${
            patientInfo.calorieintake
          }`,
        ],
      ];

      // Draw columns
      leftColumn.forEach((line, index) => {
        doc.text(line, infoX, infoY + index * 8);
      });

      rightColumn.forEach((line, index) => {
        doc.text(line, pageWidth / 2 + margin, infoY + index * 8);
      });
    };

    // Enhanced Daily Plans
    const drawDailyPlans = () => {
      // First check if patient has a diet plan
      const patientDiet = patient?.latestVisit[0]?.diet?.meals;
      if (!patientDiet) return;

      // Group meals by day
      const dayMeals: Record<string, Record<string, string>> = {};
      Object.entries(patientDiet).forEach(([mealType, details]) => {
        details.split("\n\n").forEach((line) => {
          if (line.trim()) {
            const [day, meal] = line.split(": ");
            if (day && meal) {
              dayMeals[day.trim()] = dayMeals[day.trim()] || {};
              dayMeals[day.trim()][mealType] = meal.trim();
            }
          }
        });
      });

      // Sort days to ensure they appear in order (J1 to J7)
      const sortedDays = Object.keys(dayMeals).sort();

      // Meal type translations
      const mealTypes = {
        breakfast: language === "fr" ? "Petit Déjeuner" : "Breakfast",
        morningSnack:
          language === "fr" ? "Collation Matinale" : "Morning Snack",
        lunch: language === "fr" ? "Déjeuner" : "Lunch",
        afternoonSnack:
          language === "fr" ? "Collation Après-midi" : "Afternoon Snack",
        dinner: language === "fr" ? "Dîner" : "Dinner",
      };

      // Draw patient info on first page
      drawHeader();
      drawPatientInfo();

      // Draw each day on a new page
      sortedDays.forEach((day, index) => {
        if (index > 0) {
          // Add new page for each day except first one
          doc.addPage();
          drawHeader();
        }

        let currentY = 110; // Start position after patient info for first page

        if (index > 0) {
          currentY = 50; // Start position for subsequent pages
        }

        // Draw day header
        doc.setFillColor(...colors.primary);
        doc.roundedRect(
          margin,
          currentY - 5,
          pageWidth - 2 * margin,
          12,
          2,
          2,
          "F"
        );

        doc.setFontSize(16);
        doc.setTextColor(...colors.white);
        doc.setFont("helvetica", "bold");
        doc.text(day, margin + 5, currentY + 4);

        currentY += 20;

        // Draw meals for this day
        Object.entries(mealTypes).forEach(([type, title]) => {
          if (dayMeals[day][type]) {
            // Meal title with enhanced styling
            doc.setFillColor(...colors.lightGray);
            doc.roundedRect(
              margin + 10,
              currentY - 3,
              pageWidth - 2 * margin - 20,
              8,
              1,
              1,
              "F"
            );

            doc.setFontSize(11);
            doc.setTextColor(...colors.primary);
            doc.setFont("helvetica", "bold");
            doc.text(title, margin + 15, currentY + 3);

            currentY += 12;

            // Meal content with bullet points
            doc.setFontSize(10);
            doc.setTextColor(...colors.text);
            doc.setFont("helvetica", "normal");

            const lines = doc.splitTextToSize(
              dayMeals[day][type],
              pageWidth - margin * 2 - 30
            );

            lines.forEach((line: string) => {
              if (line.trim()) {
                doc.text("•", margin + 20, currentY);
                doc.text(line, margin + 25, currentY);
                currentY += 6;
              }
            });

            currentY += 8; // Space between meals
          }
        });

        // Add footer with date and page number
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.text(
          `${language === "fr" ? "Date:" : "Date:"} ${patientInfo.date}`,
          margin,
          pageHeight - margin
        );
        doc.text(
          `${language === "fr" ? "Page" : "Page"} ${index + 1}/${
            sortedDays.length
          }`,
          pageWidth - margin - 30,
          pageHeight - margin
        );
      });
    };

    // Rest of your existing code...
    drawHeader();
    drawPatientInfo();
    drawDailyPlans();

    doc.save(`regime-${patient?.firstname || "patient"}-${version.name}.pdf`);
  };

  const currentVersion = versions.find((v) => v.id === selectedVersion);

  return (
    <div className="space-y-6">
      {/* Version Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.versions}</span>
            <Button
              onClick={() => setIsCreatingVersion(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t.createVersion}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCreatingVersion && (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={t.newVersionName}
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
              />
              <Button onClick={handleCreateVersion} size="sm">
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingVersion(false);
                  setNewVersionName("");
                }}
                size="sm"
              >
                {t.cancel}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {versions.map((version) => (
              <div key={version.id} className="flex items-center gap-1">
                <Button
                  variant={
                    selectedVersion === version.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedVersion(version.id)}
                  className="flex items-center gap-2"
                >
                  {version.name}
                  <Badge variant="secondary" className="text-xs">
                    {version.selectedDays.length}
                  </Badge>
                </Button>
                {versions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVersion(version.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day Plans Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dayPlans}</CardTitle>
          {currentVersion && (
            <p className="text-sm text-muted-foreground">
              {currentVersion.selectedDays.length} {t.selectedForVersion} "
              {currentVersion.name}"
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {allDays.map((dayId) => {
              const plan = getCurrentDietPlan(dayId);
              if (!plan) return null;

              const isSelected =
                currentVersion?.selectedDays.includes(dayId) || false;

              return (
                <AccordionItem key={dayId} value={dayId}>
                  <div className="flex items-center justify-between w-full py-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleDaySelectionForVersion(
                            dayId,
                            checked as boolean
                          )
                        }
                      />
                      <span className="font-semibold text-lg">{dayId}</span>
                    </div>
                  </div>
                  <AccordionTrigger className="hover:no-underline pt-0 pb-4">
                    <span className="text-sm text-muted-foreground">
                      {t.viewDayDetails}
                    </span>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {/* Meals */}
                      <div className="grid gap-3">
                        {Object.entries(plan.meals)
                          .filter(
                            ([mealType, meal]) =>
                              meal.details && meal.details.trim() !== ""
                          )
                          .map(([mealType, meal]) => {
                            const isEditing =
                              editingMeal?.dayId === dayId &&
                              editingMeal?.mealType === mealType;

                            return (
                              <div key={mealType} className="relative group">
                                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600">
                                  {/* Meal Type Indicator */}
                                  <div className="flex flex-col items-center gap-3 min-w-[70px] flex-shrink-0">
                                    {/* Icon Container */}
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800">
                                      <span className="text-xl">
                                        {getMealIcon(mealType)}
                                      </span>
                                    </div>

                                    {/* Meal Type Label */}
                                    <span
                                      className="text-xs font-semibold text-blue-700 dark:text-blue-300 text-center leading-tight px-2 py-1 bg-blue-50 dark:bg-blue-900/50 rounded-md min-h-[24px] flex items-center justify-center max-w-[70px] border border-blue-100 dark:border-blue-800"
                                      title={t[mealType as keyof typeof t]}
                                    >
                                      {t[mealType as keyof typeof t]}
                                    </span>
                                  </div>

                                  {/* Main Content */}
                                  <div className="flex-1 min-w-0 space-y-4">
                                    {/* Meal Header */}
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                          <Input
                                            value={meal.name}
                                            onChange={(e) =>
                                              handleMealEdit(
                                                dayId,
                                                mealType,
                                                "name",
                                                e.target.value
                                              )
                                            }
                                            className="text-base font-semibold h-10 border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Nom du plat"
                                          />
                                        ) : (
                                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                            {meal.name}
                                          </h4>
                                        )}
                                      </div>

                                      {/* Controls Section */}
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                        {/* Edit Button */}
                                        {isEditing ? (
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={handleSaveMealEdit}
                                              className="h-9 w-9 p-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors rounded-lg"
                                            >
                                              <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={handleCancelMealEdit}
                                              className="h-9 w-9 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors rounded-lg"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              setEditingMeal({
                                                dayId,
                                                mealType,
                                              })
                                            }
                                            className="h-9 w-9 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors rounded-lg"
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </Button>
                                        )}

                                        {/* Select Diet Button */}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleSelectSingleMeal(
                                              dayId,
                                              mealType
                                            )
                                          }
                                          className="h-9 w-9 p-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/50 transition-colors rounded-lg"
                                          title={t.selectAndAssign}
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Meal Details */}
                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                      {isEditing ? (
                                        <Textarea
                                          value={meal.details}
                                          onChange={(e) =>
                                            handleMealEdit(
                                              dayId,
                                              mealType,
                                              "details",
                                              e.target.value
                                            )
                                          }
                                          className="text-sm min-h-[100px] resize-none border-gray-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                          placeholder="Détails du repas, ingrédients, préparation..."
                                        />
                                      ) : (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg p-4">
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {meal.details ||
                                              t.noDetailsAvailable}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Selected Days Action */}
            {currentVersion && currentVersion.selectedDays.length > 0 && (
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAssignSelectedDays}
                >
                  {t.assignToPatient} - {currentVersion.name} (
                  {currentVersion.selectedDays.length} jours)
                </Button>
                <Button onClick={generatePDF} variant="outline" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  {t.downloadPdf}
                </Button>
              </div>
            )}

            {/* Add Custom Diet Button */}
          </div>
        </CardContent>
      </Card>

      {/* Add Custom Diet Modal */}
      {isAddingDiet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t.addDiet}</h3>
            <div className="space-y-4">
              <Input
                placeholder={t.dietName}
                value={newDietForm.name}
                onChange={(e) =>
                  setNewDietForm({ ...newDietForm, name: e.target.value })
                }
              />

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.breakfast}
                  </label>
                  <Textarea
                    placeholder={t.breakfast}
                    value={newDietForm.meals.breakfast}
                    onChange={(e) =>
                      setNewDietForm({
                        ...newDietForm,
                        meals: {
                          ...newDietForm.meals,
                          breakfast: e.target.value,
                        },
                      })
                    }
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.morningSnack}
                  </label>
                  <Textarea
                    placeholder={t.morningSnack}
                    value={newDietForm.meals.morningSnack}
                    onChange={(e) =>
                      setNewDietForm({
                        ...newDietForm,
                        meals: {
                          ...newDietForm.meals,
                          morningSnack: e.target.value,
                        },
                      })
                    }
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.lunch}
                  </label>
                  <Textarea
                    placeholder={t.lunch}
                    value={newDietForm.meals.lunch}
                    onChange={(e) =>
                      setNewDietForm({
                        ...newDietForm,
                        meals: { ...newDietForm.meals, lunch: e.target.value },
                      })
                    }
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.afternoonSnack}
                  </label>
                  <Textarea
                    placeholder={t.afternoonSnack}
                    value={newDietForm.meals.afternoonSnack}
                    onChange={(e) =>
                      setNewDietForm({
                        ...newDietForm,
                        meals: {
                          ...newDietForm.meals,
                          afternoonSnack: e.target.value,
                        },
                      })
                    }
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.dinner}
                  </label>
                  <Textarea
                    placeholder={t.dinner}
                    value={newDietForm.meals.dinner}
                    onChange={(e) =>
                      setNewDietForm({
                        ...newDietForm,
                        meals: { ...newDietForm.meals, dinner: e.target.value },
                      })
                    }
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingDiet(false);
                  setNewDietForm({
                    name: "",
                    meals: {
                      breakfast: "",
                      morningSnack: "",
                      lunch: "",
                      afternoonSnack: "",
                      dinner: "",
                    },
                  });
                }}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleAddCustomDiet}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {t.saveAndAssign}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
