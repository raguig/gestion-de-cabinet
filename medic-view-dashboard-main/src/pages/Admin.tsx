import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  UserPlus,
  Activity,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleUserRound, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define admin translations
const adminTranslations = {
  header: {
    title: { fr: "Administration", en: "Administration" },
    subtitle: {
      fr: "Gestion des docteurs et statistiques",
      en: "Doctor management and statistics",
    },
  },
  stats: {
    totalDoctors: { fr: "Total Docteurs", en: "Total Doctors" },
    totalPatients: { fr: "Total Patients", en: "Total Patients" },
    allDoctorsIncluded: {
      fr: "Tous les docteurs confondus",
      en: "All doctors included",
    },
    averagePatients: {
      fr: "Moyenne Patients/Docteur",
      en: "Average Patients/Doctor",
    },
    averagePerDoctor: {
      fr: "En moyenne par docteur",
      en: "On average per doctor",
    },
  },
  search: {
    placeholder: {
      fr: "Rechercher un docteur...",
      en: "Search for a doctor...",
    },
  },
  buttons: {
    addDoctor: { fr: "Ajouter Docteur", en: "Add Doctor" },
    edit: { fr: "Modifier", en: "Edit" },
    cancel: { fr: "Annuler", en: "Cancel" },
    add: { fr: "Ajouter", en: "Add" },
  },
  form: {
    addDoctor: { fr: "Ajouter un docteur", en: "Add a doctor" },
    editDoctor: { fr: "Modifier le docteur", en: "Edit doctor" },
    firstName: { fr: "Prénom", en: "First Name" },
    lastName: { fr: "Nom", en: "Last Name" },
    email: { fr: "Email", en: "Email" },
    phone: { fr: "Téléphone", en: "Phone" },
    password: { fr: "Mot de passe", en: "Password" },
    specialty: { fr: "Spécialité", en: "Specialty" },
    gender: {
      fr: "Genre",
      en: "Gender",
    },
    male: {
      fr: "Homme",
      en: "Male",
    },
    female: {
      fr: "Femme",
      en: "Female",
    },
    subscription: {
      fr: "Abonnement",
      en: "Subscription",
    },
    tier: {
      fr: "Pack",
      en: "Pack",
    },
    billing: {
      fr: "Facturation",
      en: "Billing",
    },
    monthly: {
      fr: "Mensuelle",
      en: "Monthly",
    },
    annual: {
      fr: "Annuelle",
      en: "Annual",
    },
  },
  table: {
    title: { fr: "Liste des Docteurs", en: "Doctors List" },
    fullName: { fr: "Nom complet", en: "Full Name" },
    email: { fr: "Email", en: "Email" },
    phone: { fr: "Téléphone", en: "Phone" },
    specialty: { fr: "Spécialité", en: "Specialty" },
    patients: { fr: "Patients", en: "Patients" },
    actions: { fr: "Actions", en: "Actions" },
    loading: { fr: "Chargement...", en: "Loading..." },
    noResults: { fr: "Aucun docteur trouvé", en: "No doctors found" },
    adjustSearch: {
      fr: "Ajustez vos critères de recherche",
      en: "Adjust your search criteria",
    },
    patient: { fr: "patient", en: "patient" },
  },
  messages: {
    doctorAdded: { fr: "Docteur ajouté", en: "Doctor added" },
    doctorModified: { fr: "Docteur modifié", en: "Doctor modified" },
    doctorDeleted: { fr: "Docteur supprimé", en: "Doctor deleted" },
    addSuccess: {
      fr: "Le nouveau docteur a été ajouté avec succès.",
      en: "The new doctor has been added successfully.",
    },
    updateSuccess: {
      fr: "Les informations du docteur ont été mises à jour avec succès.",
      en: "Doctor information has been updated successfully.",
    },
    deleteSuccess: {
      fr: "Le docteur a été supprimé avec succès.",
      en: "The doctor has been deleted successfully.",
    },
    error: { fr: "Erreur", en: "Error" },
    fetchError: {
      fr: "Impossible de récupérer les docteurs.",
      en: "Unable to fetch doctors.",
    },
    saveError: {
      fr: "Impossible d'enregistrer le docteur.",
      en: "Unable to save doctor.",
    },
    deleteError: {
      fr: "Impossible de supprimer le docteur.",
      en: "Unable to delete doctor.",
    },
  },
  subscription: {
    details: {
      fr: "Détails de l'abonnement",
      en: "Subscription Details",
    },
    usageTitle: {
      fr: "Utilisation du mois",
      en: "Monthly Usage",
    },
    timeRemaining: {
      fr: "Temps restant",
      en: "Time Remaining",
    },
    daysLeft: {
      fr: "jours restants",
      en: "days left",
    },
    features: {
      appointments: {
        fr: "Rendez-vous",
        en: "Appointments",
      },
      nutritionPlans: {
        fr: "Plans nutritionnels",
        en: "Nutrition Plans",
      },
      workoutPlans: {
        fr: "Programmes d'entraînement",
        en: "Workout Plans",
      },
      aiDiets: {
        fr: "Régimes IA",
        en: "AI Diets",
      },
    },
    billing: {
      type: {
        fr: "Type de facturation",
        en: "Billing Type",
      },
      price: {
        fr: "Prix",
        en: "Price",
      },
      monthly: {
        fr: "Mensuel",
        en: "Monthly",
      },
      yearly: {
        fr: "Annuel",
        en: "Yearly",
      },
    },
  },
};

interface Doctor {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
  patientsCount: number;
  password?: string;
  gender: "male" | "female";
  subscription?: {
    tier: "essentiel" | "premium" | "pro";
    isAnnual: boolean;
    isActive: boolean;
    startDate: string;
    endDate: string;
    monthlyUsage: {
      appointments: number;
      nutritionPlans: number;
      workoutPlans: number;
      aiDiets: number;
    };
  };
}

const TIER_LIMITS = {
  essentiel: {
    appointments: 100,
    nutritionPlans: 120,
    workoutPlans: 80,
    aiDiets: 60,
  },
  premium: {
    appointments: 300,
    nutritionPlans: 1300,
    workoutPlans: 800,
    aiDiets: 525,
  },
  pro: {
    appointments: Infinity,
    nutritionPlans: Infinity,
    workoutPlans: Infinity,
    aiDiets: Infinity,
  },
};

const TIER_PRICES = {
  essentiel: {
    monthly: 750,
    yearly: 7200,
  },
  premium: {
    monthly: 1000,
    yearly: 9996,
  },
  pro: {
    monthly: 1625,
    yearly: 15600,
  },
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "premium":
      return "text-amber-500 border-amber-500 bg-amber-500/10";
    case "pro":
      return "text-purple-500 border-purple-500 bg-purple-500/10";
    default:
      return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
  }
};

const getUsageColor = (percentage: number) => {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 75) return "bg-amber-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-emerald-500";
};

const Admin = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Helper function to get translated text
  const getT = (obj: { fr: string; en: string } | undefined) => {
    if (!obj) return "";
    return obj[language] || obj.fr || "";
  };

  const form = useForm<Omit<Doctor, "id" | "patientsCount" | "status">>({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      specialty: "",
      password: "",
      gender: "male",
      subscription: {
        tier: "essentiel",
        isAnnual: false,
        isActive: true,
      },
    },
  });

  // Fetch doctors from the backend
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();
      setDoctors(data.doctors);
      setTotalPatients(data.totalPatients);
    } catch (error) {
      toast({
        title: getT(adminTranslations.messages.error),
        description: getT(adminTranslations.messages.fetchError),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(
    (doctor) =>
      (doctor.firstname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (doctor.lastname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (
    data: Omit<Doctor, "id" | "patientsCount" | "status">
  ) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...data,
        // Only include password if it's provided and we're adding a new doctor
        ...((!editingDoctor && data.password) ? { password: data.password } : {})
      };

      const url = editingDoctor
        ? `${import.meta.env.VITE_BACKEND_URL}api/doctors/${editingDoctor.id}`
        : `${import.meta.env.VITE_BACKEND_URL}api/doctors`;

      const response = await fetch(url, {
        method: editingDoctor ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save doctor");
      }

      toast({
        title: editingDoctor
          ? getT(adminTranslations.messages.doctorModified)
          : getT(adminTranslations.messages.doctorAdded),
        description: editingDoctor
          ? getT(adminTranslations.messages.updateSuccess)
          : getT(adminTranslations.messages.addSuccess),
      });

      setIsDialogOpen(false);
      setEditingDoctor(null);
      form.reset();
      await fetchDoctors();
    } catch (error: any) {
      toast({
        title: getT(adminTranslations.messages.error),
        description:
          error.message || getT(adminTranslations.messages.saveError),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (doctor: Doctor) => {
    const subscription = doctor.subscription || {
      tier: "essentiel",
      isAnnual: false,
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyUsage: {
        appointments: 0,
        nutritionPlans: 0,
        workoutPlans: 0,
        aiDiets: 0,
      },
    };

    setEditingDoctor(doctor);
    setSelectedDoctor({
      ...doctor,
      subscription,
    });

    form.reset({
      firstname: doctor.firstname,
      lastname: doctor.lastname,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      password: "",
      gender: doctor.gender,
      subscription: {
        tier: subscription.tier,
        isAnnual: subscription.isAnnual,
        isActive: subscription.isActive,
      },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/doctors/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      toast({
        title: getT(adminTranslations.messages.doctorDeleted),
        description: getT(adminTranslations.messages.deleteSuccess),
        variant: "destructive",
      });
      fetchDoctors();
    } catch (error) {
      toast({
        title: getT(adminTranslations.messages.error),
        description: getT(adminTranslations.messages.deleteError),
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setEditingDoctor(null);
    form.reset({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      specialty: "",
      password: "",
      gender: "male",
      subscription: {
        tier: "essentiel",
        isAnnual: false,
       
      }, // You can keep a default value for gender or set it to undefined
    });
    setIsDialogOpen(true);
  };

  // Add validation patterns near the top of the file
  const LETTERS_ONLY_PATTERN = /^[A-Za-zÀ-ÿ\s-]+$/;
  const NUMBERS_ONLY_PATTERN = /^[0-9+]+$/;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {getT(adminTranslations.header.title)}
              </h1>
              <p className="text-muted-foreground font-medium">
                {getT(adminTranslations.header.subtitle)}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                {getT(adminTranslations.stats.totalDoctors)}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground mb-1">
                {loading ? "..." : doctors.length}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center mr-3 group-hover:bg-secondary/20 transition-colors">
                  <UserPlus className="h-4 w-4 text-secondary" />
                </div>
                {getT(adminTranslations.stats.totalPatients)}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground mb-1">
                {loading ? "..." : totalPatients}
              </div>
              <p className="text-sm text-muted-foreground">
                {getT(adminTranslations.stats.allDoctorsIncluded)}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"></div>
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3 group-hover:bg-emerald-500/20 transition-colors">
                  <Activity className="h-4 w-4 text-emerald-500" />
                </div>
                {getT(adminTranslations.stats.averagePatients)}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground mb-1">
                {loading
                  ? "..."
                  : doctors.length
                  ? Math.round(totalPatients / doctors.length)
                  : 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {getT(adminTranslations.stats.averagePerDoctor)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Search */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between bg-card/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={getT(adminTranslations.search.placeholder)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl focus:bg-background transition-colors"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAddNew}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                {getT(adminTranslations.buttons.addDoctor)}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDoctor
                    ? getT(adminTranslations.form.editDoctor)
                    : getT(adminTranslations.form.addDoctor)}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.firstName)}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jean"
                                maxLength={30}
                                {...field}
                                onChange={(e) => {
                                  if (
                                    e.target.value === "" ||
                                    LETTERS_ONLY_PATTERN.test(e.target.value)
                                  ) {
                                    field.onChange(e);
                                  }
                                }}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.lastName)}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Dupont"
                                maxLength={30}
                                {...field}
                                onChange={(e) => {
                                  if (
                                    e.target.value === "" ||
                                    LETTERS_ONLY_PATTERN.test(e.target.value)
                                  ) {
                                    field.onChange(e);
                                  }
                                }}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.email)}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="jean.dupont@clinic.com"
                                type="email"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.phone)}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+33 1 23 45 67 89"
                                maxLength={15}
                                {...field}
                                onChange={(e) => {
                                  if (
                                    e.target.value === "" ||
                                    NUMBERS_ONLY_PATTERN.test(e.target.value)
                                  ) {
                                    field.onChange(e);
                                  }
                                }}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.specialty)}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cardiologie"
                                maxLength={50}
                                {...field}
                                onChange={(e) => {
                                  if (
                                    e.target.value === "" ||
                                    LETTERS_ONLY_PATTERN.test(e.target.value)
                                  ) {
                                    field.onChange(e);
                                  }
                                }}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.gender)}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue
                                    placeholder={getT(adminTranslations.form.gender)}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">
                                  {getT(adminTranslations.form.male)}
                                </SelectItem>
                                <SelectItem value="female">
                                  {getT(adminTranslations.form.female)}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Only show password field for new doctors */}
                    
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.password)}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    

                    {/* Subscription Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <FormField
                        control={form.control}
                        name="subscription.tier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.tier)}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select pack" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="essentiel">Pack Essentiel</SelectItem>
                                <SelectItem value="premium">Pack Premium</SelectItem>
                                <SelectItem value="pro">Pack Pro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subscription.isAnnual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getT(adminTranslations.form.billing)}</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value === "true")}
                              defaultValue={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select billing cycle" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="false">
                                  {getT(adminTranslations.form.monthly)}
                                </SelectItem>
                                <SelectItem value="true">
                                  {getT(adminTranslations.form.annual)}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-6">
                    <Button type="submit" className="flex-1">
                      {editingDoctor
                        ? getT(adminTranslations.buttons.edit)
                        : getT(adminTranslations.buttons.add)}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      {getT(adminTranslations.buttons.cancel)}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showSubscriptionDetails}
            onOpenChange={setShowSubscriptionDetails}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{getT(adminTranslations.subscription.details)}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-3 py-1",
                      getTierColor(
                        selectedDoctor?.subscription?.tier || "essentiel"
                      )
                    )}
                  >
                    {selectedDoctor?.subscription?.tier.toUpperCase()}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              {selectedDoctor?.subscription && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg border bg-card/50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {getT(adminTranslations.subscription.billing.type)}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5",
                            selectedDoctor.subscription.isAnnual
                              ? "bg-blue-500/10 text-blue-500 border-blue-500"
                              : "bg-slate-500/10 text-slate-500 border-slate-500"
                          )}
                        >
                          {selectedDoctor.subscription.isAnnual
                            ? getT(
                                adminTranslations.subscription.billing.yearly
                              )
                            : getT(
                                adminTranslations.subscription.billing.monthly
                              )}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {getT(adminTranslations.subscription.billing.price)}
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {selectedDoctor.subscription.isAnnual
                            ? TIER_PRICES[selectedDoctor.subscription.tier]
                                .yearly
                            : TIER_PRICES[selectedDoctor.subscription.tier]
                                .monthly}{" "}
                          MAD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      {getT(adminTranslations.subscription.usageTitle)}
                    </h3>
                    <div className="grid gap-3">
                      {Object.entries(
                        selectedDoctor.subscription.monthlyUsage
                      ).map(([feature, usage]) => {
                        const limit =
                          TIER_LIMITS[selectedDoctor.subscription.tier][
                            feature
                          ];
                        const remaining =
                          limit === Infinity ? "∞" : limit - usage;
                        const percentage =
                          limit === Infinity ? 0 : (usage / limit) * 100;

                        return (
                          <div key={feature} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {getT(
                                  adminTranslations.subscription.features[
                                    feature
                                  ]
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  {usage}/{limit === Infinity ? "∞" : limit}
                                </span>
                                <Badge
                                  variant={
                                    remaining === 0 ? "destructive" : "outline"
                                  }
                                >
                                  {remaining === "∞"
                                    ? "∞"
                                    : `${remaining} left`}
                                </Badge>
                              </div>
                            </div>
                            <Progress
                              value={percentage}
                              className="h-2"
                              indicatorClassName={cn(
                                remaining === 0 && "bg-destructive",
                                remaining === "∞" && "bg-primary"
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      {getT(adminTranslations.subscription.timeRemaining)}
                    </h3>
                    <div className="space-y-2">
                      {(() => {
                        const endDate = new Date(
                          selectedDoctor.subscription.endDate
                        );
                        const startDate = new Date(
                          selectedDoctor.subscription.startDate
                        );
                        const now = new Date();
                        const total = endDate.getTime() - startDate.getTime();
                        const elapsed = now.getTime() - startDate.getTime();
                        const percentage = ((total - elapsed) / total) * 100;
                        const daysLeft = Math.max(
                          0,
                          Math.ceil(
                            (endDate.getTime() - now.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        );

                        return (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                {new Date(
                                  selectedDoctor.subscription.startDate
                                ).toLocaleDateString()}
                              </span>
                              <Badge
                                variant={
                                  daysLeft < 7 ? "destructive" : "outline"
                                }
                              >
                                {daysLeft}{" "}
                                {getT(adminTranslations.subscription.daysLeft)}
                              </Badge>
                              <span>
                                {new Date(
                                  selectedDoctor.subscription.endDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-4 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {getT(adminTranslations.subscription.billing.type)}
                      </span>
                      <Badge
                        variant={
                          selectedDoctor.subscription?.isAnnual
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {selectedDoctor.subscription?.isAnnual
                          ? getT(adminTranslations.subscription.billing.yearly)
                          : getT(
                              adminTranslations.subscription.billing.monthly
                            )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {getT(adminTranslations.subscription.billing.price)}
                      </span>
                      <span className="text-lg font-bold">
                        {selectedDoctor.subscription?.isAnnual
                          ? TIER_PRICES[selectedDoctor.subscription.tier].yearly
                          : TIER_PRICES[selectedDoctor.subscription.tier]
                              .monthly}{" "}
                        MAD
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Doctors Table */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              {getT(adminTranslations.table.title)} ({filteredDoctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/40">
                    <TableHead className="font-semibold text-foreground py-4">
                      {getT(adminTranslations.table.fullName)}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {getT(adminTranslations.table.email)}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {getT(adminTranslations.table.phone)}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {getT(adminTranslations.table.specialty)}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {getT(adminTranslations.table.patients)}
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      {getT(adminTranslations.table.actions)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-muted-foreground">
                            {getT(adminTranslations.table.loading)}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <TableRow
                        key={doctor.id}
                        className="hover:bg-muted/20 transition-colors border-border/30"
                      >
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              {doctor.gender === "female" ? (
                                <CircleUserRound className="h-4 w-4 text-primary" />
                              ) : (
                                <UserCircle2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            {doctor.firstname} {doctor.lastname}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doctor.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doctor.phone}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-background/50">
                            {doctor.specialty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-secondary/20 text-secondary-foreground flex items-center gap-1.5"
                            >
                              <UserPlus className="h-3 w-3 text-secondary" />
                              <span>{doctor.patientsCount}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {doctor.patientsCount === 1
                                ? getT(adminTranslations.table.patient)
                                : getT(adminTranslations.table.patients)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "bg-background/50",
                                  doctor.subscription?.tier === "premium" &&
                                    "border-primary text-primary",
                                  doctor.subscription?.tier === "pro" &&
                                    "border-secondary text-secondary"
                                )}
                              >
                                {doctor.subscription?.tier
                                  ?.charAt(0)
                                  .toUpperCase() +
                                  doctor.subscription?.tier?.slice(1) ||
                                  "Essentiel"}
                              </Badge>
                              <Badge
                                variant={
                                  doctor.subscription?.isAnnual
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {doctor.subscription?.isAnnual
                                  ? getT(adminTranslations.form.annual)
                                  : getT(adminTranslations.form.monthly)}
                              </Badge>
                            </div>

                            {doctor.subscription?.endDate && (
                              <div className="text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    {new Date(
                                      doctor.subscription.startDate
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="text-muted-foreground">
                                    →
                                  </span>
                                  <span className="text-muted-foreground">
                                    {new Date(
                                      doctor.subscription.endDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>

                                
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleEdit(doctor);
                                setSelectedDoctor(doctor);
                               
                              }}
                              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(doctor.id)}
                              className="h-9 w-9 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setShowSubscriptionDetails(true);
                              }}
                              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {filteredDoctors.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground text-lg">
                            {getT(adminTranslations.table.noResults)}
                          </p>
                          <p className="text-sm text-muted-foreground/70">
                            {getT(adminTranslations.table.adjustSearch)}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
