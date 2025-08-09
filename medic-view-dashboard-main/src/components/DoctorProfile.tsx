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
};

interface DoctorData {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  patientsCount: number;
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
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
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]);

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
          axios.get(`https://amine-back.vercel.app/api/doctors/${doctorId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://amine-back.vercel.app/api/doctors/${doctorId}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDoctorData(doctorResponse.data);

        // Update stats with real data and translations
        setStats([
          {
            icon: Users,
            label: profileTranslations.stats.totalPatients,
            value: statsResponse.data.totalPatients,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
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
            color: "text-purple-600",
            bgColor: "bg-purple-50",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                      Dr. {doctorData.fullName}
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
                      <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                          ? "bg-blue-100 dark:bg-blue-900/50"
                          : index === 1
                          ? "bg-green-100 dark:bg-green-900/50"
                          : "bg-purple-100 dark:bg-purple-900/50"
                      }`}
                    >
                      <stat.icon
                        className={`h-7 w-7 ${
                          index === 0
                            ? "text-blue-600 dark:text-blue-400"
                            : index === 1
                            ? "text-green-600 dark:text-green-400"
                            : "text-purple-600 dark:text-purple-400"
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
      </div>
    </div>
  );
};

export default DoctorProfile;
