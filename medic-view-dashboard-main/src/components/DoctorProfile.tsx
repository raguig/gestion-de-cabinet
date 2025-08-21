import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Award,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Define profile translations
const profileTranslations = {
  header: {
    title: { fr: "Profil Médecin", en: "Doctor Profile" },
    subtitle: {
      fr: "Informations personnelles et statistiques",
      en: "Personal information and statistics",
    },
  },
  contact: {
    email: { fr: "Email", en: "Email" },
    phone: { fr: "Téléphone", en: "Phone" },
    specialty: {
      fr: "Spécialité non spécifiée",
      en: "Specialty not specified",
    },
  },
  stats: {
    totalPatients: { fr: "Total Patients", en: "Total Patients" },
    todayAppointments: { fr: "RDV Aujourd'hui", en: "Today's Appointments" },
    monthlyPatients: { fr: "Patients ce mois", en: "Patients this month" },
  },
  loading: { fr: "Chargement...", en: "Loading..." },
  error: { fr: "Erreur", en: "Error" },
  authRequired: {
    fr: "Authentification requise",
    en: "Authentication required",
  },
  errorOccurred: { fr: "Une erreur s'est produite", en: "An error occurred" },
  subscription: {
    title: { fr: "Utilisation de l'abonnement", en: "Subscription Usage" },
    features: {
      appointments: { fr: "Rendez-vous", en: "Appointments" },
      nutritionPlans: { fr: "Plans nutritionnels", en: "Nutrition Plans" },
      workoutPlans: { fr: "Plans d'entraînement", en: "Workout Plans" },
      aiDiets: { fr: "Régimes IA", en: "AI Diets" },
    },
    remaining: { fr: "restants", en: "remaining" },
    unlimited: { fr: "Illimité", en: "Unlimited" },
    tier: {
      fr: "Niveau d'abonnement:",
      en: "Subscription Tier:",
    },
    expires: {
      fr: "Expire le:",
      en: "Expires on:",
    },
  },
};

interface DoctorData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  specialty: string;
  patientsCount: number;
}

interface SubscriptionUsage {
  appointments: number;
  nutritionPlans: number;
  workoutPlans: number;
  aiDiets: number;
}

interface SubscriptionData {
  tier: string;
  isAnnual: boolean;
  endDate: string;
  monthlyUsage: SubscriptionUsage;
  limits: SubscriptionUsage;
}

const DoctorProfile = () => {
  const { language } = useLanguage();
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    {
      icon: Users,
      label: { fr: "Total Patients", en: "Total Patients" },
      value: 0,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Calendar,
      label: { fr: "RDV Aujourd'hui", en: "Today's Appointments" },
      value: 0,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Clock,
      label: { fr: "Patients ce mois", en: "Patients this month" },
      value: 0,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  // Helper function to get translated text
  const getT = (obj: { fr: string; en: string } | undefined) => {
    if (!obj) return "";
    return obj[language] || obj.fr || "";
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem("token");
        const doctorId = localStorage.getItem("doctorId");

        if (!token || !doctorId) {
          throw new Error(getT(profileTranslations.authRequired));
        }

        // Fetch both doctor data and stats concurrently
        const [doctorResponse, statsResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}api/doctors/${doctorId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}api/doctors/${doctorId}/stats`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setDoctorData(doctorResponse.data);

        // Update stats with real data and translations
        setStats([
          {
            icon: Users,
            label: profileTranslations.stats.totalPatients,
            value: statsResponse.data.totalPatients,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            icon: Calendar,
            label: profileTranslations.stats.todayAppointments,
            value: statsResponse.data.todayAppointments,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
          {
            icon: Clock,
            label: profileTranslations.stats.monthlyPatients,
            value: statsResponse.data.monthlyPatients,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : getT(profileTranslations.errorOccurred)
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [language]); // Re-fetch when language changes

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/doctors/subscription/usage`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubscriptionData(response.data);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      }
    };

    fetchSubscriptionData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            {getT(profileTranslations.loading)}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {getT(profileTranslations.error)}
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return null;
  }

  const SubscriptionUsageCard = () => {
    if (!subscriptionData) return null;

    const features = [
      "appointments",
      "nutritionPlans",
      "workoutPlans",
      "aiDiets",
    ] as const;

    return (
      <div className="lg:col-span-3 mt-8">
        <div className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-2xl p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {getT(profileTranslations.subscription.title)}
              </h3>
              <div className="space-y-1 text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {getT(profileTranslations.subscription.tier)}{" "}
                  <span className="font-semibold text-primary capitalize">
                    {subscriptionData.tier}
                  </span>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {getT(profileTranslations.subscription.expires)}{" "}
                  <span className="font-semibold text-primary">
                    {new Date(subscriptionData.endDate).toLocaleDateString(
                      language === "fr" ? "fr-FR" : "en-US"
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature) => {
                const used = subscriptionData.monthlyUsage[feature];
                const limit = subscriptionData.limits[feature];
                const remaining = limit === Infinity ? Infinity : limit - used;
                const percentage = limit === Infinity ? 0 : (used / limit) * 100;

                return (
                  <div
                    key={feature}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3"
                  >
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {getT(profileTranslations.subscription.features[feature])}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          {used} / {limit === Infinity ? "∞" : limit}
                        </span>
                        <span className="font-medium text-primary">
                          {remaining === Infinity
                            ? getT(profileTranslations.subscription.unlimited)
                            : `${remaining} ${getT(profileTranslations.subscription.remaining)}`}
                        </span>
                      </div>
                      {limit !== Infinity && (
                        <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {getT(profileTranslations.header.title)}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {getT(profileTranslations.header.subtitle)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Information Card */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-2xl">
              <div className="p-6 pb-6">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                      Dr. {doctorData.firstname} {doctorData.lastname}
                    </h2>
                    <div className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {doctorData.specialty ||
                        getT(profileTranslations.contact.specialty)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getT(profileTranslations.contact.email)}
                        </p>
                        <p className="font-medium text-slate-800 dark:text-white truncate">
                          {doctorData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getT(profileTranslations.contact.phone)}
                        </p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {doctorData.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="space-y-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                        index === 0
                          ? "bg-primary/10 dark:bg-primary/20"
                          : index === 1
                          ? "bg-green-100 dark:bg-green-900/50"
                          : "bg-primary/10 dark:bg-primary/20"
                      }`}
                    >
                      <stat.icon
                        className={`h-7 w-7 ${
                          index === 0
                            ? "text-primary dark:text-primary/80"
                            : index === 1
                            ? "text-green-600 dark:text-green-400"
                            : "text-primary dark:text-primary/80"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {getT(stat.label)}
                      </p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Usage Card */}
        <SubscriptionUsageCard />
      </div>
    </div>
  );
};

export default DoctorProfile;
