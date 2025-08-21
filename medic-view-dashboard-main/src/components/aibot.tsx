import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, User, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Extend the existing botTranslations with additional UI elements
const botTranslations = {
  header: {
    title: { fr: "Assistant Nutritionnel IA", en: "AI Nutrition Assistant" },
    subtitle: {
      fr: "Analyse personnalisée et recommandations nutritionnelles",
      en: "Personalized analysis and nutritional recommendations",
    },
  },
  form: {
    patientData: { fr: "Données du patient", en: "Patient Data" },
    subtitle: {
      fr: "Informations nécessaires pour l'analyse",
      en: "Information needed for analysis",
    },
    weight: { fr: "Poids (kg)", en: "Weight (kg)" },
    height: { fr: "Taille (cm)", en: "Height (cm)" },
    goal: { fr: "Objectif", en: "Goal" },
    goals: {
      maintain: { fr: "Maintenir le poids", en: "Maintain weight" },
      lose: { fr: "Perdre du poids", en: "Lose weight" },
      gain: { fr: "Prendre du poids", en: "Gain weight" },
    },
    favoriteFood: {
      label: {
        fr: "Aliments préférés (optionnel)",
        en: "Favorite foods (optional)",
      },
      placeholder: {
        fr: "Ex: chocolat, pâtes, fruits...",
        en: "Ex: chocolate, pasta, fruits...",
      },
    },
    bmi: {
      title: { fr: "Indice de Masse Corporelle", en: "Body Mass Index" },
      categories: {
        underweight: { fr: "Insuffisance pondérale", en: "Underweight" },
        normal: { fr: "Poids normal", en: "Normal weight" },
        overweight: { fr: "Surpoids", en: "Overweight" },
        obese: { fr: "Obésité", en: "Obese" },
      },
    },
    buttons: {
      analyze: { fr: "Analyser", en: "Analyze" },
      reset: { fr: "Réinitialiser", en: "Reset" },
    },
  },
  chat: {
    title: { fr: "Analyse IA", en: "AI Analysis" },
    subtitle: {
      fr: "Recommandations nutritionnelles personnalisées",
      en: "Personalized nutritional recommendations",
    },
    analyzing: {
      fr: "L'IA analyse les données...",
      en: "AI analyzing data...",
    },
    welcome: {
      fr: "Bonjour! Je suis votre assistant nutritionnel IA. Veuillez remplir les informations du patient pour commencer.",
      en: "Hello! I'm your AI nutrition assistant. Please fill in the patient information to begin.",
    },
    error: {
      fr: "❌ Désolé, une erreur s'est produite lors de la génération du régime alimentaire. Veuillez réessayer.",
      en: "❌ Sorry, an error occurred while generating the diet plan. Please try again.",
    },
  },
  stats: {
    bmr: { fr: "BMR", en: "BMR" },
    target: { fr: "Cible", en: "Target" },
    proteins: { fr: "Protéines", en: "Proteins" },
    carbs: { fr: "Glucides", en: "Carbs" },
  },
  ui: {
    bmiDisplay: {
      title: { fr: "Indice de Masse Corporelle", en: "Body Mass Index" },
    },
    patientInfo: {
      weight: { fr: "Poids (kg)", en: "Weight (kg)" },
      height: { fr: "Taille (cm)", en: "Height (cm)" },
      goal: { fr: "Objectif", en: "Goal" },
      goals: {
        maintain: { fr: "Maintenir le poids", en: "Maintain weight" },
        lose: { fr: "Perdre du poids", en: "Lose weight" },
        gain: { fr: "Prendre du poids", en: "Gain weight" },
      },
      favoriteFoods: {
        fr: "Aliments préférés (optionnel)",
        en: "Favorite foods (optional)",
      },
      foodPlaceholder: {
        fr: "Ex: chocolat, pâtes, fruits...",
        en: "Ex: chocolate, pasta, fruits...",
      },
    },
    buttons: {
      analyze: { fr: "Analyser", en: "Analyze" },
      reset: { fr: "Réinitialiser", en: "Reset" },
      submit: { fr: "Envoyer", en: "Submit" },
    },
    stats: {
      bmr: { fr: "Métabolisme de base", en: "BMR" },
      target: { fr: "Cible", en: "Target" },
      proteins: { fr: "Protéines", en: "Proteins" },
      carbs: { fr: "Glucides", en: "Carbs" },
    },
    analysis: {
      analyzing: {
        fr: "L'IA analyse les données...",
        en: "AI analyzing data...",
      },
      title: { fr: "Analyse IA", en: "AI Analysis" },
      subtitle: {
        fr: "Recommandations nutritionnelles personnalisées",
        en: "Personalized nutritional recommendations",
      },
    },
  },

  // Add translations for AI response formatting
  aiResponse: {
    profile: { fr: "Profil du patient", en: "Patient Profile" },
    weight: { fr: "Poids", en: "Weight" },
    height: { fr: "Taille", en: "Height" },
    bmi: { fr: "IMC", en: "BMI" },
    goal: { fr: "Objectif", en: "Goal" },
    calories: {
      title: {
        fr: "Recommandations caloriques",
        en: "Caloric Recommendations",
      },
      bmr: { fr: "Métabolisme de base", en: "Base Metabolism" },
      target: { fr: "Apport calorique cible", en: "Target Caloric Intake" },
      daily: {
        fr: "Objectif calorique journalier établi",
        en: "Daily caloric goal established",
      },
    },
    macros: {
      title: {
        fr: "Répartition des macronutriments",
        en: "Macronutrient Distribution",
      },
      proteins: { fr: "Protéines", en: "Proteins" },
      carbs: { fr: "Glucides", en: "Carbs" },
      fats: { fr: "Lipides", en: "Fats" },
    },
    favorites: {
      title: {
        fr: "Intégration des aliments préférés",
        en: "Integration of Favorite Foods",
      },
      message: {
        fr: "Le patient apprécie \"{foods}\". Je recommande d'intégrer cet aliment dans le plan alimentaire avec des portions contrôlées pour maintenir la motivation et l'adhésion au régime.",
        en: 'The patient enjoys "{foods}". I recommend incorporating this food into the meal plan with controlled portions to maintain motivation and diet adherence.',
      },
    },
    advice: {
      title: { fr: "Conseils personnalisés", en: "Personalized Advice" },
      underweight: {
        fr: [
          "Privilégier des aliments riches en calories saines",
          "Augmenter la fréquence des repas",
          "Ajouter des collations nutritives",
        ],
        en: [
          "Prioritize healthy calorie-dense foods",
          "Increase meal frequency",
          "Add nutritious snacks",
        ],
      },
      overweight: {
        fr: [
          "Réduire les portions progressivement",
          "Privilégier les légumes et protéines maigres",
          "Augmenter l'activité physique",
        ],
        en: [
          "Gradually reduce portions",
          "Prioritize vegetables and lean proteins",
          "Increase physical activity",
        ],
      },
      normal: {
        fr: [
          "Maintenir l'équilibre nutritionnel actuel",
          "Varier les sources de nutriments",
          "Rester attentif aux signaux de faim et satiété",
        ],
        en: [
          "Maintain current nutritional balance",
          "Vary nutrient sources",
          "Stay mindful of hunger and satiety signals",
        ],
      },
    },
  },
  patientSelect: {
    placeholder: {
      fr: "Sélectionner un patient",
      en: "Select a patient",
    },
    search: {
      fr: "Rechercher un patient...",
      en: "Search patient...",
    },
    noResults: {
      fr: "Aucun patient trouvé",
      en: "No patients found",
    },
    title: {
      fr: "Liste des patients",
      en: "Patient List",
    },
    subtitle: {
      fr: "Sélectionnez un patient pour l'analyse",
      en: "Select a patient for analysis",
    },
  },
  mainHeader: {
    title: {
      fr: "Assistant Nutritionnel IA",
      en: "AI Nutrition Assistant",
    },
    subtitle: {
      fr: "Analyse personnalisée et recommandations nutritionnelles",
      en: "Personalized analysis and nutritional recommendations",
    },
  },
  messages: {
    startMessage: {
      fr: "Sélectionnez un patient pour commencer l'analyse.",
      en: "Select a patient to begin the analysis.",
    },
    loadError: {
      fr: "Erreur lors du chargement des patients.",
      en: "Error loading patients.",
    },
    analysisFor: {
      fr: "Analyse pour",
      en: "Analysis for",
    },
    generationError: {
      fr: "Erreur lors de la génération de l'analyse.",
      en: "Error generating analysis.",
    },
    analyzing: {
      fr: "L'IA analyse les données...",
      en: "AI is analyzing data...",
    },
  },
  recommendations: {
    title: {
      fr: "Recommandations",
      en: "Recommendations",
    },
    default: {
      fr: "Recommandation",
      en: "Recommendation",
    },
  },
};

const getT = (obj: { fr: string; en: string } | undefined, language: string): string => {
  if (!obj) return "";
  return obj[language as keyof typeof obj] || obj.fr || "";
};

const AINutritionChatbot = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: getT(botTranslations.messages.startMessage, language),
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [recommendations, setRecommendations] = useState(null);

  // Fetch patients for the doctor
  useEffect(() => {
    async function fetchPatients() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}api/ai/patients`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setPatients(data || []);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: getT(botTranslations.messages.loadError, language),
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatients();
  }, []);

  // Send selected patient data to AI
  const handleAnalyze = async () => {
    if (!selectedPatient || !selectedPatient.latestVisit) return;
    setIsLoading(true);

    // Prepare payload
    const visit = selectedPatient.latestVisit;
    const payload = {
      bmi: visit.bmi,
      age: selectedPatient.age,
      gender: selectedPatient.sex,
      weight: visit.weight,
      height: selectedPatient.height,
      calorieIntake: visit.calorieintake,
      rythm: visit.rythm,
      goal: visit.goal,
      language,
    };

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: `${getT(botTranslations.messages.analysisFor, language)} ${selectedPatient.firstname} ${selectedPatient.lastname}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/ai/generate-diet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: data.analysis,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: getT(botTranslations.messages.generationError, language),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const PatientSelectCard = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { language } = useLanguage();

    const filteredPatients = patients.filter((patient) => {
      const fullName = `${patient.firstname} ${patient.lastname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });

    return (
      <Card className="lg:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {getT(botTranslations.patientSelect.title, language)}
              </CardTitle>
              <CardDescription>
                {getT(botTranslations.patientSelect.subtitle, language)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={getT(botTranslations.patientSelect.search, language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Patient select */}
          <Select
            value={selectedPatient?._id || ""}
            onValueChange={(value) => {
              const patient = patients.find((p) => p._id === value);
              setSelectedPatient(patient);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={getT(botTranslations.patientSelect.placeholder, language)}
              />
            </SelectTrigger>
            <SelectContent>
              {filteredPatients.map((patient) => (
                <SelectItem
                  key={patient._id}
                  value={patient._id}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-medium">
                      {patient.firstname} {patient.lastname}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {patient.age}{" "}
                      {language === "fr" ? "ans" : "yrs"} •{" "}
                      {patient.sex === "male" ? "♂️" : "♀️"}
                    </span>
                  </div>
                </SelectItem>
              ))}
              {filteredPatients.length === 0 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {getT(botTranslations.patientSelect.noResults, language)}
                </div>
              )}
            </SelectContent>
          </Select>

          {/* Selected patient details */}
          {selectedPatient && selectedPatient.latestVisit && (
            <div className="mt-4 p-4 rounded-lg bg-muted/20 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {language === "fr" ? "Poids:" : "Weight:"}
                  </span>
                  <br />
                  <span className="font-medium">
                    {selectedPatient.latestVisit.weight} kg
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">IMC/BMI:</span>
                  <br />
                  <span className="font-medium">
                    {selectedPatient.latestVisit.bmi}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {language === "fr" ? "Objectif:" : "Goal:"}
                  </span>
                  <br />
                  <span className="font-medium">
                    {selectedPatient.latestVisit.goal}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {language === "fr" ? "Calories:" : "Calories:"}
                  </span>
                  <br />
                  <span className="font-medium">
                    {selectedPatient.latestVisit.calorieintake}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full mt-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                {language === "fr" ? "Analyser" : "Analyze"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {getT(botTranslations.mainHeader.title, language)}
              </h1>
              <p className="text-muted-foreground">
                {getT(botTranslations.mainHeader.subtitle, language)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List instead of Input Form */}
          <PatientSelectCard />

          {/* Chat Interface */}
          <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Bot className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {getT(botTranslations.chat.title, language)}
                  </CardTitle>
                  <CardDescription>
                    {getT(botTranslations.chat.subtitle, language)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/10 rounded-xl">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.type === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.type === "bot" ? "bg-primary/10" : "bg-success/10"
                      }`}
                    >
                      {message.type === "bot" ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-4 rounded-xl ${
                        message.type === "bot"
                          ? "bg-gradient-to-br from-primary/5 to-muted border border-primary/20 shadow-sm"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {/* If bot response, style with sections and bold */}
                      {message.type === "bot" ? (
                        <div className="space-y-2">
                          {/* Replace **text** with <strong>text</strong> for bold and * for list */}
                          {message.content.split("\n").map((line, i) => {
                            // Replace **text** with <strong>text</strong>
                            let formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                            // If line starts with "*", render as list item
                            if (line.trim().startsWith("*")) {
                              formattedLine = `<li class="ml-4 list-disc">${formattedLine.replace(/^\*\s*/, "")}</li>`;
                              return (
                                <ul key={i} className="pl-4">
                                  <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                                </ul>
                              );
                            }
                            return (
                              <div
                                key={i}
                                className={`${
                                  line.startsWith("Profil") || line.startsWith("Patient Profile")
                                    ? "font-bold text-primary text-lg mb-2"
                                    : line.startsWith("Objectif") || line.startsWith("Goal")
                                    ? "font-semibold text-success"
                                    : line.startsWith("Calories") || line.startsWith("Caloric Recommendations")
                                    ? "font-semibold text-orange-600"
                                    : line.startsWith("Conseils") || line.startsWith("Advice")
                                    ? "font-semibold text-blue-600"
                                    : ""
                                }`}
                                dangerouslySetInnerHTML={{ __html: formattedLine }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <span>{message.content}</span>
                      )}
                      <div
                        className={`text-xs mt-2 opacity-70 ${
                          message.type === "user" ? "text-right" : ""
                        }`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-card border p-4 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {getT(botTranslations.messages.analyzing, language)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {recommendations && Array.isArray(recommendations) && recommendations.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, idx) => (
                    <Card key={idx} className="border-success/30 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-success text-lg">
                          {rec.title || `${getT(botTranslations.recommendations.default, language)} ${idx + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {rec.description
                            ? rec.description
                            : typeof rec === "string"
                              ? rec
                              : Object.entries(rec).map(([key, value]) => (
                                  <div key={key} className="mb-2">
                                    <span className="font-semibold capitalize">{key}:</span>{" "}
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {recommendations && !Array.isArray(recommendations) && typeof recommendations === "string" && recommendations.trim() !== "" && (
                <div className="mt-8 p-4 rounded bg-gradient-to-br from-success/10 to-muted/10 border border-success/20 shadow">
                  <h3 className="font-bold text-success mb-2">
                    {getT(botTranslations.recommendations.title, language)}
                  </h3>
                  <div className="text-sm whitespace-pre-line">{recommendations}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AINutritionChatbot;
