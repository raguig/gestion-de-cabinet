import { useState, useEffect } from "react";
import dietPlansData from "../../public/diet-plans.json";
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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DietEditorSlideProps {
  language: "fr" | "en";
  calorieintake?: number;
  visitId: string;
  onDietAssigned?: () => void;
  patient?: any;
  hasDiet?: boolean;
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
  hasDiet = false,
}: DietEditorSlideProps) {
  const [versions, setVersions] = useState<DietVersion[]>([
    { id: "v1", name: "Équilibré", selectedDays: [] },
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
      dietAlreadyAssigned:
        "Un régime est déjà assigné. Veuillez d'abord le supprimer avant d'en assigner un nouveau.",
      deleteDietFirst: "Supprimer le régime actuel",
      subscriptionLimit: {
        title: "Limite d'abonnement atteinte",
        description: (current: number, limit: number, tier: string) =>
          `Vous avez atteint votre limite mensuelle de régimes (${current}/${limit}) pour votre abonnement ${tier}.`,
        upgrade: "Mettre à niveau",
      },
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
      dietAlreadyAssigned:
        "A diet is already assigned. Please delete it first before assigning a new one.",
      deleteDietFirst: "Delete current diet",
      subscriptionLimit: {
        title: "Subscription Limit Reached",
        description: (current: number, limit: number, tier: string) =>
          `You have reached your monthly diet plan limit (${current}/${limit}) for your ${tier} subscription.`,
        upgrade: "Upgrade",
      },
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
        const formattedMeals = {
          breakfast: {
            name: getMealName("breakfast", dayPlan.meals?.breakfast || []),
            details: formatMealDetails(
              dayPlan.meals?.["Petit-Déjeuner"] ||
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

  const handleAssignSelectedDays = async () => {
    try {
      if (hasDiet) {
        toast.error(t.dietAlreadyAssigned);
        return;
      }

      const token = localStorage.getItem("token");
      const currentVersion = versions.find((v) => v.id === selectedVersion);

      if (!currentVersion || currentVersion.selectedDays.length === 0) {
        toast.error(
          language === "fr"
            ? "Veuillez sélectionner au moins un jour à assigner."
            : "Please select at least one day to assign."
        );
        return;
      }

      const selectedDaysData = currentVersion.selectedDays.map((dayId) => {
        const plan = getCurrentDietPlan(dayId);
        return {
          day: dayId,
          ...plan,
        };
      });

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

      const addDietResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/patients/diets`,
        dietData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdDiet = addDietResponse.data.dietPlan;

      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }api/patients/visits/${visitId}/assign-diet`,
        { dietId: createdDiet._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        language === "fr"
          ? "Régime assigné avec succès!"
          : "Diet assigned successfully!",
        {
          className:
            "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
          descriptionClassName: "text-green-800 dark:text-green-200",
          style: {
            color: "rgb(21 128 61)",
          },
        }
      );

      if (onDietAssigned) {
        onDietAssigned();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        const limitData = error.response.data;
        toast.error(
          t.subscriptionLimit.description(
            limitData.currentUsage,
            limitData.limit,
            limitData.tier
          ),
          {
            duration: 5000,
            action: {
              label: t.subscriptionLimit.upgrade,
              onClick: () => {
                // Navigate to upgrade page or show upgrade modal
                window.location.href = "/admin";
              },
            },
            className:
              "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800",
            style: {
              color: "rgb(185 28 28)",
            },
          }
        );
      } else {
        toast.error(
          language === "fr"
            ? "Échec de l'assignation du régime."
            : "Failed to assign diet."
        );
      }
    }
  };

  const handleAddCustomDiet = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!newDietForm.name.trim()) {
        toast.error(
          language === "fr"
            ? "Veuillez entrer un nom de régime."
            : "Please enter a diet name.",
          {
            className:
              "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
            descriptionClassName: "text-red-800 dark:text-red-200",
            style: {
              color: "rgb(185 28 28)",
            },
          }
        );
        return;
      }

      const addDietResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/patients/diets`,
        newDietForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdDiet = addDietResponse.data.dietPlan;

      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }api/patients/visits/${visitId}/assign-diet`,
        { dietId: createdDiet._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        language === "fr"
          ? "Régime personnalisé ajouté avec succès!"
          : "Custom diet added successfully!",
        {
          className:
            "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
          descriptionClassName: "text-green-800 dark:text-green-200",
          style: {
            color: "rgb(21 128 61)",
          },
        }
      );

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
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        const limitData = error.response.data;
        toast.error(
          t.subscriptionLimit.description(
            limitData.currentUsage,
            limitData.limit,
            limitData.tier
          ),
          {
            duration: 5000,
            action: {
              label: t.subscriptionLimit.upgrade,
              onClick: () => {
                window.location.href = "/admin";
              },
            },
            className:
              "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800",
            style: {
              color: "rgb(185 28 28)",
            },
          }
        );
      } else {
        toast.error(
          language === "fr"
            ? "Échec de l'ajout du régime personnalisé."
            : "Failed to add custom diet."
        );
      }
    }
  };

  // Updated PDF generation function using template
  const generatePDF = async () => {
    try {
      const version = versions.find((v) => v.id === selectedVersion);

      // First, we need to load the template PDF
      const templateUrl = "/Diettemplate.pdf";
      const existingPdfBytes = await fetch(templateUrl).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Get the pages from template
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Get page dimensions
      const { width, height } = firstPage.getSize();

      // Embed fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
      );
      console.log(patient);
      // Patient information
      const patientInfo = {
        name: `${patient?.firstname || ""} ${patient?.lastname || ""}`,
        age: patient?.age || "--",
        sex: patient?.sex || "--",
        weight: patient?.latestVisit?.[0]?.weight
          ? `${patient.latestVisit[0].weight} kg`
          : "--",
        height: patient?.height ? `${patient.height} cm` : "--",
        bmi: patient?.latestVisit?.[0]?.bmi
          ? patient.latestVisit[0].bmi.toFixed(1)
          : "--",
        calorieintake: patient?.latestVisit?.[0]?.calorieintake
          ? `${patient.latestVisit[0].calorieintake.toFixed(0)} kcal`
          : "--",
        currentWeight: patient?.latestVisit?.[0]?.weight || "--",
        targetWeight: patient?.targetWeight || "--",
        date: new Date().toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US"
        ),
        doctor: patient?.doctor?.lastname || "--",
      };

      // Define text positions for both first and second page layouts
      const textPositions = {
        // Patient details section (same for all pages)
        patientName: { x: 102, y: height - 246 },
        age: { x: 102, y: height - 282 },
        sex: { x: 102, y: height - 316 },
        currentWeight: { x: 396, y: height - 246 },
        height: { x: 351, y: height - 282 },
        targetWeight: { x: 414, y: height - 315 },
        startDate: { x: 171, y: height - 160 },
        doctor: { x: 444, y: height - 20 },
        notes: { x: 50, y: height - 550 },

        // First page meal sections
        breakfast: { x: 52, y: height - 405, width: 156 },
        morningSnack: { x: 52, y: height - 648, width: 156 },
        lunch: { x: 222, y: height - 405, width: 156 },
        afternoonSnack: { x: 222, y: height - 648, width: 156 },
        dinner: { x: 397, y: height - 405, width: 156 },

        // Second page meal sections (different positions for second page layout)
        breakfastSecond: { x: 52, y: height - 108, width: 153 },
        morningSnackSecond: { x: 52, y: height - 351, width: 153 },
        lunchSecond: { x: 220, y: height - 108, width: 153 },
        afternoonSnackSecond: { x: 220, y: height - 351, width: 153 },
        dinnerSecond: { x: 395, y: height - 108, width: 153 },
      };

      // Helper function to fill patient information on any page
      const fillPatientInfo = (page) => {
        page.drawText(patientInfo.name, {
          x: textPositions.patientName.x,
          y: textPositions.patientName.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(patientInfo.age.toString(), {
          x: textPositions.age.x,
          y: textPositions.age.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(patientInfo.sex.toString(), {
          x: textPositions.sex.x,
          y: textPositions.sex.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(patientInfo.currentWeight.toString(), {
          x: textPositions.currentWeight.x,
          y: textPositions.currentWeight.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(patientInfo.height, {
          x: textPositions.height.x,
          y: textPositions.height.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(patientInfo.targetWeight.toString(), {
          x: textPositions.targetWeight.x,
          y: textPositions.targetWeight.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        page.drawText(patientInfo.date, {
          x: textPositions.startDate.x,
          y: textPositions.startDate.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(patientInfo.doctor, {
          x: textPositions.doctor.x,
          y: textPositions.doctor.y,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      };

      // Helper function to draw text with word wrapping
      const drawTextWithWrapping = (page, text, position, options = {}) => {
        if (!text) return;

        const { x, y, width = 156 } = position;
        const {
          size = 10,
          font = helveticaFont,
          color = rgb(0, 0, 0),
          maxLines = 4,
        } = options;

        const lines = text.split("\n").slice(0, maxLines);
        let currentY = y;

        lines.forEach((line) => {
          const words = line.split(" ");
          let currentLine = "";

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, size);

            if (textWidth <= width) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                page.drawText(currentLine, {
                  x,
                  y: currentY,
                  size,
                  font,
                  color,
                });
                currentY -= 15;
              }
              currentLine = word;
            }
          }

          if (currentLine) {
            page.drawText(currentLine, {
              x,
              y: currentY,
              size,
              font,
              color,
            });
            currentY -= 15;
          }
        });
      };

      // Helper function to fill meal data on a page
      const fillMealData = (
        page,
        dayData,
        day,
        useSecondPageLayout = false
      ) => {
        const formatMeal = (mealDetails) => {
          if (!mealDetails) return "";
          return mealDetails.replace(/\n/g, " ").trim();
        };

        // Choose the appropriate meal positions based on page layout
        const mealPositions = useSecondPageLayout
          ? {
              breakfast: textPositions.breakfastSecond,
              morningSnack: textPositions.morningSnackSecond,
              lunch: textPositions.lunchSecond,
              afternoonSnack: textPositions.afternoonSnackSecond,
              dinner: textPositions.dinnerSecond,
            }
          : {
              breakfast: textPositions.breakfast,
              morningSnack: textPositions.morningSnack,
              lunch: textPositions.lunch,
              afternoonSnack: textPositions.afternoonSnack,
              dinner: textPositions.dinner,
            };

        // Fill meals
        if (dayData.breakfast) {
          const text = formatMeal(dayData.breakfast);
          drawTextWithWrapping(page, text, mealPositions.breakfast);
        }

        if (dayData.morningSnack) {
          const text = formatMeal(dayData.morningSnack);
          drawTextWithWrapping(page, text, mealPositions.morningSnack, {
            maxLines: 3,
          });
        }

        if (dayData.lunch) {
          const text = formatMeal(dayData.lunch);
          drawTextWithWrapping(page, text, mealPositions.lunch);
        }

        if (dayData.afternoonSnack) {
          const text = formatMeal(dayData.afternoonSnack);
          drawTextWithWrapping(page, text, mealPositions.afternoonSnack, {
            maxLines: 3,
          });
        }

        if (dayData.dinner) {
          const text = formatMeal(dayData.dinner);
          drawTextWithWrapping(page, text, mealPositions.dinner);
        }

        // Add day indicator

        // Add notes
      };

      // Fill patient information on first page
      fillPatientInfo(firstPage);

      // Get patient diet meals
      const patientDiet = patient?.latestVisit?.[0]?.diet?.meals;

      if (patientDiet) {
        // Group meals by day first
        const dayMeals = {};
        Object.entries(patientDiet).forEach(([mealType, details]) => {
          if (details) {
            details.split("\n\n").forEach((line) => {
              if (line.trim()) {
                const [day, meal] = line.split(": ");
                if (day && meal) {
                  const dayKey = day.trim();
                  dayMeals[dayKey] = dayMeals[dayKey] || {};
                  dayMeals[dayKey][mealType] = meal.trim();
                }
              }
            });
          }
        });

        const sortedDays = Object.keys(dayMeals).sort();

        if (sortedDays.length > 0) {
          // First day goes on the first page (using first page layout)
          const firstDay = sortedDays[0];
          const firstDayMeals = dayMeals[firstDay];
          fillMealData(firstPage, firstDayMeals, firstDay, false);

          // Handle remaining days (day 2, 3, 4, etc.) - each gets a NEW page based on page 2 template
          for (let i = 1; i < sortedDays.length; i++) {
            const currentDay = sortedDays[i];
            const dayData = dayMeals[currentDay];

            let targetPage;

            // Always create new pages for day 2 and beyond to avoid data overlap
            // Determine which page to copy from template
            let pageIndexToCopy;
            if (pages.length > 1) {
              // Copy from the second page of template
              pageIndexToCopy = 1;
            } else {
              // If template only has one page, copy from the first page
              pageIndexToCopy = 0;
            }

            // Create a fresh copy for each day (including day 2)
            const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [
              pageIndexToCopy,
            ]);
            targetPage = pdfDoc.addPage(copiedPage);

            // Fill patient information on this page

            // Fill meal data using second page layout (or first page layout if template only has 1 page)
            const useSecondPageLayout = pages.length > 1;
            fillMealData(targetPage, dayData, currentDay, useSecondPageLayout);
          }
        }
      }
      if (pages.length > 1) {
        pdfDoc.removePage(1); // Remove second page (index 1)
      }
      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Create blob and download
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `regime-${patient?.firstname || "patient"}-${
        version.name
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        language === "fr"
          ? "PDF généré avec succès!"
          : "PDF generated successfully!",
        {
          className:
            "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
          descriptionClassName: "text-green-800 dark:text-green-200",
          style: { color: "rgb(21 128 61)" },
        }
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        language === "fr"
          ? "Erreur lors de la génération du PDF"
          : "Error generating PDF",
        {
          className:
            "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
          descriptionClassName: "text-red-800 dark:text-red-200",
          style: { color: "rgb(185 28 28)" },
        }
      );
    }
  };
  const currentVersion = versions.find((v) => v.id === selectedVersion);

  return (
    <div className="space-y-6">
      {/* Day Plans Accordion */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30">
          <CardTitle className="text-2xl text-primary dark:text-primary">
            {t.dayPlans}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion type="multiple" className="w-full space-y-4">
            {allDays.map((dayId) => {
              const plan = getCurrentDietPlan(dayId);
              if (!plan) return null;

              const isSelected =
                currentVersion?.selectedDays.includes(dayId) || false;

              return (
                <AccordionItem
                  key={dayId}
                  value={dayId}
                  className="border rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-t-xl">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleDaySelectionForVersion(
                            dayId,
                            checked as boolean
                          )
                        }
                        className="h-5 w-5"
                      />
                      <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
                        {dayId}
                      </span>
                    </div>
                    <AccordionTrigger className="hover:no-underline py-2 px-4 text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80">
                      <span className="text-sm font-medium">
                        {t.viewDayDetails}
                      </span>
                    </AccordionTrigger>
                  </div>

                  <AccordionContent className="p-4">
                    <div className="grid gap-6">
                      {Object.entries(plan.meals)
                        .filter(
                          ([_, meal]) =>
                            meal.details && meal.details.trim() !== ""
                        )
                        .map(([mealType, meal]) => {
                          const isEditing =
                            editingMeal?.dayId === dayId &&
                            editingMeal?.mealType === mealType;

                          return (
                            <div key={mealType} className="relative group">
                              <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4 lg:w-48 flex-shrink-0">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 flex items-center justify-center shadow-inner border border-primary/20 dark:border-primary/30">
                                    <span className="text-2xl text-primary dark:text-primary">
                                      {getMealIcon(mealType)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-primary dark:text-primary">
                                      {t[mealType as keyof typeof t]}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0 space-y-4">
                                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <div className="flex-1">
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
                                          className="text-lg font-semibold border-2 border-primary/30 dark:border-primary/40 rounded-lg focus:border-primary focus:ring-primary"
                                          placeholder="Nom du plat"
                                        />
                                      ) : (
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                          {meal.name}
                                        </h3>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {isEditing ? (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleSaveMealEdit}
                                            className="h-10 w-10 rounded-lg bg-success/10 dark:bg-success/20 text-success dark:text-success hover:bg-success/20"
                                          >
                                            <Check className="h-5 w-5" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCancelMealEdit}
                                            className="h-10 w-10 rounded-lg bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive hover:bg-destructive/20"
                                          >
                                            <X className="h-5 w-5" />
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            setEditingMeal({ dayId, mealType })
                                          }
                                          className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary hover:bg-primary/20"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-6 shadow-inner">
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
                                        className="min-h-[120px] text-base leading-relaxed border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-primary"
                                        placeholder="Détails du repas, ingrédients, préparation..."
                                      />
                                    ) : (
                                      <div className="prose dark:prose-invert max-w-none space-y-2">
                                        {meal.details ? (
                                          meal.details
                                            .split("\n")
                                            .map((line, index) => (
                                              <p
                                                key={index}
                                                className={cn(
                                                  "text-lg tracking-wide",
                                                  "font-medium text-gray-900 dark:text-gray-100",
                                                  "leading-relaxed",
                                                  line.startsWith("-") ||
                                                    line.startsWith("•")
                                                    ? "pl-4"
                                                    : "font-semibold"
                                                )}
                                              >
                                                {line.trim() &&
                                                !line.startsWith("-") &&
                                                !line.startsWith("•")
                                                  ? `• ${line}`
                                                  : line}
                                              </p>
                                            ))
                                        ) : (
                                          <p className="text-base italic text-gray-500 dark:text-gray-400">
                                            {t.noDetailsAvailable}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
            <div className="flex gap-3">
              {hasDiet ? (
                <div className="flex-1 flex items-center justify-between px-4 py-3 bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg">
                  <span className="text-destructive dark:text-destructive">
                    {t.dietAlreadyAssigned}
                  </span>
                </div>
              ) : (
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  onClick={handleAssignSelectedDays}
                >
                  {t.assignToPatient} - {currentVersion?.name} (
                  {currentVersion?.selectedDays.length} jours)
                </Button>
              )}
              <Button
                onClick={generatePDF}
                variant="outline"
                size="lg"
                disabled={!hasDiet}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4 mr-2" />
                {t.downloadPdf}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Custom Diet Modal */}
      {isAddingDiet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              {t.addDiet}
            </h3>
            <div className="space-y-4">
              <Input
                placeholder={t.dietName}
                value={newDietForm.name}
                onChange={(e) =>
                  setNewDietForm({ ...newDietForm, name: e.target.value })
                }
                className="focus:border-primary focus:ring-primary"
              />

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
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
                    className="min-h-[80px] focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
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
                    className="min-h-[80px] focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
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
                    className="min-h-[80px] focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
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
                    className="min-h-[80px] focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
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
                    className="min-h-[80px] focus:border-primary focus:ring-primary"
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
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleAddCustomDiet}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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
