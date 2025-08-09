import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/component/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/component/card";
import { Badge } from "@/components/component/badge";
import { Switch } from "@/components/component/switch";
import { Input } from "@/components/component/input";
import {
  Plus,
  Search,
  Moon,
  Sun,
  Languages,
  Users,
  TrendingUp,
  Scale,
  Activity,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
} from "lucide-react";
import axios from "axios"; // Add this import
import { PatientForm } from "./PatientForm"; // Import the PatientForm component
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export type Language = "fr" | "en";
export type Gender = "M" | "F";
export type ActivityLevel = "faible" | "moderee" | "elevee";
export type Goal = "perte" | "gain" | "maintenance";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  height: number; // cm
  weight: number; // kg
  bf: number; // Body Fat Percentage
  healthScore: number; // Health Score
  activityLevel: ActivityLevel;
  goal: Goal;
  rhythm: number; // kg/week
  startDate: string;
  lastMeasure: string;
  recentWeight: number;
  bmi: number;
  age: number;
}

// Initialize empty patient for new entries
const emptyPatient = {
  firstName: "",
  lastName: "",
  gender: "M" as Gender,
  birthDate: "",
  height: 0,
  weight: 0,
  bf: 0,
  healthScore: 0,
  activityLevel: "moderee" as ActivityLevel,
  goal: "maintenance" as Goal,
  rhythm: 0,
  pathalogie: "",
  allergie: "",
};

export function PatientManagement() {
  const [currentDoctor, setCurrentDoctor] = useState<string | null>(null);

  const { language } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Patient | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  const [newPatient, setNewPatient] = useState<
    Omit<
      Patient,
      | "id"
      | "age"
      | "bmi"
      | "recentWeight"
      | "lastMeasure"
      | "bf"
      | "healthScore"
      | "pathalogie"
      | "allergie"
    >
  >({
    firstName: "",
    lastName: "",
    gender: "M",
    birthDate: "",
    height: 0,
    weight: 0,
    activityLevel: "moderee",
    goal: "maintenance",
    rhythm: 0,
    startDate: new Date().toISOString().split("T")[0],
  });

  // --- API URL ---
  const API_URL = "https://amine-back-lvdsgp24s-raguigs-projects.vercel.app/api/patients"; // Adjust if needed

  // --- Fetch patients from backend ---
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const doctorId = localStorage.getItem("doctorId"); // Add this line

      const res = await axios.get("https://amine-back-lvdsgp24s-raguigs-projects.vercel.app/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          doctorId: doctorId, // Add this parameter
        },
      });

      const mapped = res.data.map((p: any) => ({
        id: p._id,
        firstName: p.firstname,
        lastName: p.lastname,
        gender: p.sex === "male" ? "M" : "F",
        birthDate: p.dateOfBirth?.slice(0, 10) || "",
        height: p.height,
        weight: p.latestVisit.weight,
        bf: p.latestVisit.bf || 0,
        healthScore: p.healthScore || 0,
        activityLevel:
          p.activityLevel === "sedentary"
            ? "faible"
            : p.activityLevel === "moderate"
            ? "moderee"
            : "elevee",
        goal:
          p.latestVisit.goal === "weight loss"
            ? "perte"
            : p.latestVisit.goal === "muscle gain"
            ? "gain"
            : "maintenance",
        rhythm: Number(p.rythm),
        startDate: p.createdAt?.slice(0, 10) || "",
        lastMeasure: p.lastmeasurement?.slice(0, 10) || "",
        recentWeight: p.latestVisit.weight,
        bmi: p.latestVisit.bmi,
        age: p.dateOfBirth ? calculateAge(p.dateOfBirth) : 0,
        pathalogie: p.pathalogie || "",
        allergie: p.allergie || "",
        doctorId: p.doctor, // Add this field
      }));
      setPatients(mapped);
    } catch (err) {
    }
  };
  useEffect(() => {
    fetchPatients();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  const getText = (key: string) => {
    const texts: Record<string, { fr: string; en: string }> = {
      title: { fr: "Gestion des Patients", en: "Patient Management" },
      totalPatients: { fr: "Total Patients", en: "Total Patients" },
      patientsWithoutRegime: { fr: "Sans Régime", en: "Without Regime" },
      averageBMI: { fr: "IMC Moyenne", en: "Average BMI" },
      addPatient: { fr: "Ajouter Patient", en: "Add Patient" },
      search: { fr: "Rechercher un patient...", en: "Search patient..." },
      fullName: { fr: "Nom Complet", en: "Full Name" },

      gender: { fr: "Sexe", en: "Gender" },
      age: { fr: "Âge", en: "Age" },
      regime: { fr: "Régime Signé", en: "Signed Regime" },
      recentWeight: { fr: "Poids Récent", en: "Recent Weight" },
      bmi: { fr: "IMC", en: "BMI" },
      "Masse Grasse": { fr: "Masse Grasse (%)", en: "Body Fat (%)" },
      "Score de Santé": { fr: "Score de Santé", en: "Health Score" },
      pathalogie: { fr: "Pathologie", en: "Pathology" },
      allergie: { fr: "Allergie", en: "Allergy" },
      objective: { fr: "Objectif", en: "Objective" },
      rhythm: { fr: "Rythme", en: "Rhythm" },
      activity: { fr: "Activité", en: "Activity" },
      lastMeasure: { fr: "Dernière Mesure", en: "Last Measure" },
      actions: { fr: "Actions", en: "Actions" },
      firstName: { fr: "Prénom", en: "First Name" },
      lastName: { fr: "Nom", en: "Last Name" },
      birthDate: { fr: "Date de Naissance", en: "Birth Date" },
      height: { fr: "Taille (cm)", en: "Height (cm)" },
      weight: { fr: "Poids (kg)", en: "Weight (kg)" },
      activityLevel: { fr: "Niveau d'Activité", en: "Activity Level" },
      goal: { fr: "Objectif", en: "Goal" },
      rhythmWeek: { fr: "Rythme (kg/semaine)", en: "Rhythm (kg/week)" },
      save: { fr: "Enregistrer", en: "Save" },
      cancel: { fr: "Annuler", en: "Cancel" },
      view: { fr: "Voir", en: "View" },
      edit: { fr: "Modifier", en: "Edit" },
      delete: { fr: "Supprimer", en: "Delete" },
      male: { fr: "Homme", en: "Male" },
      female: { fr: "Femme", en: "Female" },
      perte: { fr: "Perte de poids", en: "Weight loss" },
      gain: { fr: "Prise de masse musculaire", en: "Muscle gain" },
      maintenance: { fr: "Maintenance", en: "Maintenance" },
      faible: { fr: "Faible", en: "Low" },
      moderee: { fr: "Modérée", en: "Moderate" },
      elevee: { fr: "Élevée", en: "High" },
      requiredField: {
        fr: "Ce champ est obligatoire",
        en: "This field is required",
      },
    };
    return texts[key]?.[language] || key;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInM = height / 100;
    return parseFloat((weight / (heightInM * heightInM)).toFixed(1));
  };

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter((patient) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [patients, searchTerm, sortConfig]);

  const handleSort = (key: keyof Patient) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // --- Add patient (POST) ---
  const handleAddPatient = async () => {
    if (
      !newPatient.firstName ||
      !newPatient.lastName ||
      !newPatient.birthDate ||
      !newPatient.height ||
      !newPatient.weight
    ) {
      toast.error(getText("requiredField"), {
        className:
          "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
        descriptionClassName: "text-red-800 dark:text-red-200",
        style: {
          color: "rgb(185 28 28)", // text-red-700
        },
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/add`,
        {
          firstname: newPatient.firstName,
          lastname: newPatient.lastName,
          sex: newPatient.gender === "M" ? "male" : "female",
          dateOfBirth: newPatient.birthDate,
          weight: newPatient.weight, // Initial weight
          bf: newPatient.bf || 0, // Initial body fat
          healthScore: newPatient.healthScore || 0, // Initial health score
          height: newPatient.height,
          activityLevel:
            newPatient.activityLevel === "faible"
              ? "sedentary"
              : newPatient.activityLevel === "moderee"
              ? "moderate"
              : "active",
          goal:
            newPatient.goal === "perte"
              ? "weight loss"
              : newPatient.goal === "gain"
              ? "muscle gain"
              : "maintenance",
          rythm: String(newPatient.rhythm),
          lastmeasurement: new Date().toISOString().split("T")[0],
          pathalogie: newPatient.pathalogie || "",
          allergie: newPatient.allergie || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );

      // Refresh the patient list
      fetchPatients();
      setShowAddForm(false);

      // Success toast
      toast.success(
        language === "fr"
          ? "Patient ajouté avec succès!"
          : "Patient added successfully!",
        {
          className:
            "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
          descriptionClassName: "text-green-800 dark:text-green-200",
          style: {
            color: "rgb(21 128 61)", // text-green-700
          },
        }
      );
    } catch (err) {
      // Error toast
      toast.error(
        language === "fr"
          ? "Erreur lors de l'ajout du patient."
          : "Error adding patient.",
        {
          className:
            "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
          descriptionClassName: "text-red-800 dark:text-red-200",
          style: {
            color: "rgb(185 28 28)", // text-red-700
          },
        }
      );
    }
  };

  // --- Delete patient (DELETE) ---
  const handleDeletePatient = async (id: string) => {
    // Add confirmation toast
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-auto">
        <h3 className="text-lg font-semibold mb-4">
          {language === "fr" ? "Confirmer la suppression" : "Confirm deletion"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {language === "fr"
            ? "Êtes-vous sûr de vouloir supprimer ce patient ?"
            : "Are you sure you want to delete this patient?"}
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => toast.dismiss(t)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {language === "fr" ? "Annuler" : "Cancel"}
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await axios.delete(`${API_URL}/delete/${id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                setPatients((prev) => prev.filter((p) => p.id !== id));
                toast.dismiss(t);

                // Success toast
                toast.success(
                  language === "fr"
                    ? "Patient supprimé avec succès!"
                    : "Patient deleted successfully!",
                  {
                    className:
                      "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
                    descriptionClassName: "text-green-800 dark:text-green-200",
                    style: {
                      color: "rgb(21 128 61)",
                    },
                  }
                );
              } catch (err) {
                toast.dismiss(t);
                // Error toast
                toast.error(
                  language === "fr"
                    ? "Erreur lors de la suppression du patient."
                    : "Error deleting patient.",
                  {
                    className:
                      "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
                    descriptionClassName: "text-red-800 dark:text-red-200",
                    style: {
                      color: "rgb(185 28 28)",
                    },
                  }
                );
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {language === "fr" ? "Supprimer" : "Delete"}
          </Button>
        </div>
      </div>
    ));
  };

  // --- Update patient (PUT) ---
  const handleEditPatient = async (updatedPatient: Patient) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/update/${updatedPatient.id}`,
        {
          firstname: updatedPatient.firstName,
          lastname: updatedPatient.lastName,
          sex: updatedPatient.gender === "M" ? "male" : "female",
          dateOfBirth: updatedPatient.birthDate,
          weight: updatedPatient.weight,
          height: updatedPatient.height,
          bf: updatedPatient.bf, // Body Fat
          healthScore: updatedPatient.healthScore, // Health Score
          activityLevel:
            updatedPatient.activityLevel === "faible"
              ? "sedentary"
              : updatedPatient.activityLevel === "moderee"
              ? "moderate"
              : "active",
          goal:
            updatedPatient.goal === "perte"
              ? "weight loss"
              : updatedPatient.goal === "gain"
              ? "muscle gain"
              : "maintenance",
          rythm: String(updatedPatient.rhythm),
          lastmeasurement: updatedPatient.lastMeasure,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );
      fetchPatients();
      setEditingPatient(null);

      // Success toast
      toast.success(
        language === "fr"
          ? "Patient modifié avec succès!"
          : "Patient updated successfully!",
        {
          className:
            "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
          descriptionClassName: "text-green-800 dark:text-green-200",
          style: {
            color: "rgb(21 128 61)",
          },
        }
      );
    } catch (err) {
      // Error toast
      toast.error(
        language === "fr"
          ? "Erreur lors de la modification du patient."
          : "Error updating patient.",
        {
          className:
            "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
          descriptionClassName: "text-red-800 dark:text-red-200",
          style: {
            color: "rgb(185 28 28)",
          },
        }
      );
    }
  };

  const patientsWithoutRegime = patients.filter(
    (p) => p.goal === "maintenance"
  ).length;
  const averageBMI =
    patients.reduce((sum, p) => sum + p.bmi, 0) / patients.length;

  // --- Pagination state ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredAndSortedPatients.length / rowsPerPage);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedPatients.slice(start, start + rowsPerPage);
  }, [filteredAndSortedPatients, currentPage]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const navigate = useNavigate();

  return (
    <div className="h-full w-full">
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg shadow-blue-500/10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-700 dark:text-slate-200">
                    {getText("totalPatients")}
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Patients enregistrés
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {patients.length}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg shadow-orange-500/10 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-500/10 ring-1 ring-orange-500/20">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-700 dark:text-slate-200">
                    {getText("patientsWithoutRegime")}
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    En maintenance
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                {patientsWithoutRegime}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg shadow-emerald-500/10 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Scale className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-700 dark:text-slate-200">
                    {getText("averageBMI")}
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Indice moyen
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {averageBMI ? averageBMI.toFixed(1) : 0}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Actions and Search */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
          >
            <div className="p-1 bg-white/20 rounded-lg">
              <Plus className="h-4 w-4" />
            </div>
            {getText("addPatient")}
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="h-5 w-5" />
              </span>
              <Input
                placeholder={getText("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-0 bg-white/80 dark:bg-slate-800/80  shadow-lg shadow-slate-200/50 dark:shadow-slate-800/50 rounded-xl focus:shadow-xl focus:shadow-blue-500/20 transition-all duration-300"
              />
            </div>
          </div>
        </section>

        {/* Patient Table */}
        <section>
          <Card className="border-0 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  {getText("title")}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {filteredAndSortedPatients.length} patients
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-slate-200/50 dark:border-slate-700/50">
                      {[
                        { key: "fullName", label: getText("fullName") },

                        { key: "gender", label: getText("gender") },
                        { key: "age", label: getText("age") },
                        { key: "goal", label: getText("regime") },
                        { key: "recentWeight", label: getText("recentWeight") },
                        { key: "height", label: getText("height") },
                        { key: "bmi", label: getText("bmi") },

                        { key: "lastMeasure", label: getText("lastMeasure") },
                        { key: "actions", label: getText("actions") },
                      ].map((column) => (
                        <th
                          key={column.key}
                          className={`px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 ${
                            column.key === "actions"
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {column.key !== "actions" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                column.key !== "fullName" &&
                                handleSort(column.key as keyof Patient)
                              }
                              className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                            >
                              <span className="flex items-center gap-2">
                                {column.label}
                                {sortConfig.key === column.key && (
                                  <ArrowUpDown className="h-3 w-3 text-blue-500" />
                                )}
                              </span>
                            </Button>
                          ) : (
                            <span className="text-center block">
                              {column.label}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                    {paginatedPatients.map((patient, index) => (
                      <tr
                        key={patient.id}
                        className={`
                  group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 
                  dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 
                  transition-all duration-200 ease-out
                  ${
                    index % 2 === 0
                      ? "bg-white dark:bg-slate-900"
                      : "bg-slate-50/30 dark:bg-slate-800/30"
                  }
                `}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                      ${
                        patient.gender === "M"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-br from-pink-500 to-rose-500 text-white"
                      }
                    `}
                            >
                              {patient.firstName.charAt(0)}
                              {patient.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {`${patient.firstName} ${patient.lastName}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`
                      ${
                        patient.gender === "M"
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                          : "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-300"
                      }
                    `}
                          >
                            {getText(
                              patient.gender === "M" ? "male" : "female"
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {patient.age}
                              </span>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              ans
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              patient.goal === "perte"
                                ? "destructive"
                                : patient.goal === "gain"
                                ? "default"
                                : "secondary"
                            }
                            className={`
                      ${
                        patient.goal === "perte"
                          ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm"
                          : patient.goal === "gain"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm"
                          : "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-sm"
                      }
                    `}
                          >
                            {getText(patient.goal)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-8 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full"></div>
                            <div>
                              <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                {patient.recentWeight}
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                                  kg
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-8 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full"></div>
                            <div>
                              <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                {patient.height}
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                                  cm
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`
                      font-semibold
                      ${
                        patient.bmi < 18.5
                          ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
                          : patient.bmi > 25
                          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300"
                          : "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300"
                      }
                    `}
                          >
                            <Scale className="w-3 h-3 mr-1" />
                            {patient.bmi}
                          </Badge>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            <p className="font-medium">{patient.lastMeasure}</p>
                            <p className="text-xs opacity-75">
                              Dernière mesure
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/patients/${patient.id}`)
                              }
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPatient(patient)}
                              className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 rounded-lg transition-colors duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePatient(patient.id)} // <-- use CIN, not id
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredAndSortedPatients.length === 0 && (
                <div className="py-16 px-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Aucun patient trouvé
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {searchTerm
                      ? "Aucun patient ne correspond à votre recherche."
                      : "Commencez par ajouter votre premier patient."}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {getText("addPatient")}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Add Patient Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-[100]  backdrop-blur-md flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden border-0 shadow-2xl shadow-black/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl animate-in zoom-in-95 duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-slate-200/50 dark:border-slate-700/50 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    {getText("addPatient")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="h-10 w-10 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <PatientForm
                  patient={newPatient}
                  onChange={setNewPatient}
                  onSubmit={handleAddPatient}
                  onCancel={() => setShowAddForm(false)}
                  getText={getText}
                  isEdit={false}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Patient Modal */}
        {editingPatient && (
          <div className="fixed inset-0 z-[100]  backdrop-blur-md flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden border-0 shadow-2xl shadow-black/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl animate-in zoom-in-95 duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-slate-200/50 dark:border-slate-700/50 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    {getText("edit")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPatient(null)}
                    className="h-10 w-10 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <PatientForm
                  patient={editingPatient}
                  onChange={setEditingPatient}
                  onSubmit={() => handleEditPatient(editingPatient)}
                  onCancel={() => setEditingPatient(null)}
                  getText={getText}
                  isEdit={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Patient Modal */}
        {viewingPatient && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden border-0 shadow-2xl shadow-black/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl animate-in zoom-in-95 duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-slate-200/50 dark:border-slate-700/50 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    {`${viewingPatient.firstName} ${viewingPatient.lastName}`}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingPatient(null)}
                    className="h-10 w-10 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("fullName")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{`${viewingPatient.firstName} ${viewingPatient.lastName}`}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("gender")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {getText(
                        viewingPatient.gender === "M" ? "male" : "female"
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("age")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingPatient.age} ans
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("birthDate")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingPatient.birthDate}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("height")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingPatient.height} cm
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("weight")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingPatient.recentWeight} kg
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("bmi")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingPatient.bmi}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("activityLevel")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {getText(viewingPatient.activityLevel)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("goal")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {getText(viewingPatient.goal)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("rhythmWeek")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingPatient.rhythm} kg/semaine
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {getText("lastMeasure")}
                    </label>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingPatient.lastMeasure}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- Pagination controls below the table --- */}
        {filteredAndSortedPatients.length > rowsPerPage && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {`Page ${currentPage} / ${totalPages}`}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
