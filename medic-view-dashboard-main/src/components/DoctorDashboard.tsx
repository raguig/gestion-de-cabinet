import { Button } from "@/components/component/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/component/card";
import { Badge } from "@/components/component/badge";
import { Progress } from "@/components/component/progress";
import {
  Plus,
  UserPlus,
  Edit3,
  Calendar,
  Search,
  Clock,
  Utensils,
  AlertTriangle,
  TrendingUp,
  Phone,
  MapPin,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardTranslations } from "@/i18n/dashboardTranslations";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface DashboardData {
  appointments: {
    name: string;
    phone: string;
    time: string;
    objective: { fr: string; en: string };
    type: { fr: string; en: string };
  }[];
  recentPlans: {
    patient: string;
    age: number;
    goal: { fr: string; en: string };
    status: { fr: string; en: string };
    startWeight: number;
    currentWeight: number;
    targetWeight: number;
    completion: number;
  }[];
  patientProgress: {
    name: string;
    age: number;
    plan: { fr: string; en: string };
    startDate: string;
    progress: number;
    status: {
      fr: string;
      en: string;
    };
    lastVisit: string;
    nextVisit: string;
  }[];
  weeklyStats: {
    day: string;
    actual: number;
    target: number;
  }[];
  weeklyPatientStats: {
    totalNewPatients: number;
    totalVisits: number;
    averagePerDay: number;
    dailyBreakdown: {
      day: string;
      count: number;
    }[];
    growthRate: number; // Add growth rate
    previousWeekTotal: number; // Add previous week total
  };
}

interface PatientAlert {
  _id: string;
  name: string;
  bmi: number;
  age: number;
  lastVisit: string;
}

// Add this new component for empty states
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-muted/10 rounded-lg border border-dashed border-muted">
    <div className="p-3 rounded-full bg-muted/20">
      <AlertTriangle className="h-6 w-6 text-muted-foreground/60" />
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// Add this new component for the next appointment
const NextAppointment = ({
  appointment,
}: {
  appointment: {
    name: string;
    phone: string;
    time: string;
    objective: { fr: string; en: string };
    type: { fr: string; en: string };
  };
}) => {
  const { language } = useLanguage();
  const getT = (obj: { fr: string; en: string }) =>
    obj[language] || obj.fr || "";

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-primary">
              {language === "fr" ? "Prochain rendez-vous" : "Next Appointment"}
            </h3>
            <p className="text-xl font-bold">{appointment.name}</p>
          </div>
        </div>
        <Badge variant="default" className="text-lg px-4 py-1">
          {appointment.time}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{appointment.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{getT(appointment.type)}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {language === "fr" ? "Objectif" : "Objective"}:
          </p>
          <p className="font-medium">{getT(appointment.objective)}</p>
        </div>
      </div>
    </div>
  );
};

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const alertsPerPage = 5;

  useEffect(() => {
    // Update your fetch function to handle missing data
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Ensure data has the correct shape
        const data = response.data as DashboardData;
        if (!data) {
          throw new Error("No data received from server");
        }

        setDashboardData({
          appointments: data.appointments || [],
          recentPlans: data.recentPlans || [],
          patientProgress: data.patientProgress || [],
          weeklyStats: data.weeklyStats || [],
          weeklyPatientStats: data.weeklyPatientStats || {
            totalNewPatients: 0,
            totalVisits: 0,
            averagePerDay: 0,
            dailyBreakdown: [],
            growthRate: 0, // Initialize growth rate
            previousWeekTotal: 0, // Initialize previous week total
          },
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }api/doctors/patients/alerts?page=${currentPage}&limit=${alertsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlerts(response.data.alerts);
        setTotalPages(Math.ceil(response.data.total / alertsPerPage));
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    };

    fetchDashboardData();
    fetchAlerts();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Replace the static data with dynamic data
  const appointments = dashboardData?.appointments || [];
  const recentPlans = dashboardData?.recentPlans || [];
  const patients = dashboardData?.patientProgress || [];
  const chartData = dashboardData?.weeklyStats || [];
  console.log(dashboardData);
  // Update the getT  function to handle undefined values
  const getT = (obj: { fr: string; en: string } | undefined) => {
    if (!obj) return "";
    return obj[language] || obj.fr || ""; // Fallback to fr or empty string
  };

  // Update quickActions to include navigation
  const quickActions = [
    {
      icon: UserPlus,
      label: getT(dashboardTranslations?.quickActions?.addPatient),
      variant: "default" as const,
      onClick: () => navigate("/patients"), // Navigate to new patient form
    },
    {
      icon: Calendar,
      label: getT(dashboardTranslations?.quickActions?.schedule),
      variant: "outline" as const,
      onClick: () => navigate("/appointments"), // Navigate to new appointment form
    },
    {
      icon: Search,
      label: getT(dashboardTranslations?.quickActions?.advancedSearch),
      variant: "outline" as const,
      onClick: () => navigate("/patients"), // Navigate to patients list with search
    },
  ].filter(Boolean); // Remove any undefined entries

  // Add this component for pagination controls
  const PaginationControls = () => (
    <div className="flex justify-end gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="flex items-center text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  // Update the status badge variant function
  const getStatusBadgeVariant = (status: { fr: string; en: string }) => {
    // Normalize the status text
    const statusText = status?.fr
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    switch (statusText) {
      case "en cours":
        return "default";
      case "inactif":
        return "warning";
      case "reussi":
        return "success";
      case "abandonne":
      case "abandonnee":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Then update the status translations
  const statusTranslations = {
    "en cours": { fr: "En cours", en: "In Progress" },
    inactif: { fr: "Inactif", en: "Inactive" },
    reussi: { fr: "Réussi", en: "Success" },
    abandonne: { fr: "Abandonné", en: "Abandoned" },
  };

  // Add this translation object at the top of the file with other translations
  const dayTranslations = {
    Lundi: { fr: "Lundi", en: "Monday" },
    Mardi: { fr: "Mardi", en: "Tuesday" },
    Mercredi: { fr: "Mercredi", en: "Wednesday" },
    Jeudi: { fr: "Jeudi", en: "Thursday" },
    Vendredi: { fr: "Vendredi", en: "Friday" },
    Samedi: { fr: "Samedi", en: "Saturday" },
    Dimanche: { fr: "Dimanche", en: "Sunday" },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {getT(dashboardTranslations.sections.quickActions)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                className="h-auto flex-col gap-3 p-6 text-center hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <action.icon className="h-7 w-7" />
                <span className="text-sm leading-tight font-medium">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </section>

        {/* New Section: Weekly Patient Stats */}
        <section className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Weekly Patient Stats Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {language === "fr"
                      ? "Patients de la semaine"
                      : "Weekly Patients"}
                  </CardTitle>
                  <CardDescription>
                    {language === "fr"
                      ? "Du lundi au dimanche"
                      : "From Monday to Sunday"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData?.weeklyPatientStats ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-primary/5 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {language === "fr"
                          ? "Nouveaux Patients"
                          : "New Patients"}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {dashboardData.weeklyPatientStats.totalNewPatients}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {language === "fr" ? "Total Visites" : "Total Visits"}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {dashboardData.weeklyPatientStats.totalVisits}
                      </p>
                    </div>
                  </div>

                  {/* Daily Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {language === "fr"
                        ? "Répartition journalière"
                        : "Daily Breakdown"}
                    </h4>
                    <div className="space-y-2">
                      {dashboardData.weeklyPatientStats.dailyBreakdown.map(
                        (day, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-20 text-sm text-muted-foreground">
                              {getT(
                                dayTranslations[
                                  day.day as keyof typeof dayTranslations
                                ]
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{
                                    width: `${
                                      (day.count /
                                        dashboardData.weeklyPatientStats
                                          .totalNewPatients) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="w-8 text-sm font-medium">
                              {day.count}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Average */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      {language === "fr" ? "Moyenne par jour" : "Daily Average"}
                    </span>
                    <span className="font-semibold">
                      {dashboardData.weeklyPatientStats.averagePerDay}
                    </span>
                  </div>

                  {/* New: Weekly Growth Display */}
                  <div className="mt-4 p-3 rounded-lg bg-muted/5 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {language === "fr"
                          ? "Croissance hebdomadaire"
                          : "Weekly Growth"}
                      </span>
                      <span
                        className={`font-semibold ${
                          dashboardData.weeklyPatientStats.growthRate > 0
                            ? "text-success"
                            : dashboardData.weeklyPatientStats.growthRate < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {dashboardData.weeklyPatientStats.growthRate > 0
                          ? "+"
                          : ""}
                        {dashboardData.weeklyPatientStats.growthRate}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "fr"
                        ? `Semaine précédente: ${dashboardData.weeklyPatientStats.previousWeekTotal} patients`
                        : `Previous week: ${dashboardData.weeklyPatientStats.previousWeekTotal} patients`}
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyState
                  message={
                    language === "fr"
                      ? "Aucune donnée disponible pour cette semaine"
                      : "No data available for this week"
                  }
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Other Appointments */}
        <section className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">
                  {getT(dashboardTranslations.sections.upcomingAppointments)}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {appointments.length > 0 ? (
                <>
                  {/* Next Appointment with special styling */}
                  <div className="p-6 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-2 border-primary/30 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/20">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary">
                            {language === "fr"
                              ? "Prochain rendez-vous"
                              : "Next Appointment"}
                          </h3>
                          <p className="text-xl font-bold">
                            {appointments[0].name}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-lg px-4 py-1.5"
                      >
                        {appointments[0].time}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{appointments[0].phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{getT(appointments[0].type)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {language === "fr" ? "Objectif" : "Objective"}:
                        </p>
                        <p className="font-medium">
                          {getT(appointments[0].objective)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Appointments */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground px-2">
                      {language === "fr"
                        ? "Prochains rendez-vous"
                        : "Upcoming Appointments"}
                    </h4>
                    <div className="space-y-3">
                      {appointments.slice(1).map((apt, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200 space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{apt.name}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{apt.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{getT(apt.type)}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">{apt.time}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getT(apt.objective)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  message={
                    getT(dashboardTranslations.empty.appointments) ||
                    "No upcoming appointments"
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Diet Plans */}
          {/* <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Utensils className="h-5 w-5 text-success" />
                </div>
                <CardTitle className="text-lg">
                  {getT(dashboardTranslations.sections.recentPlans)}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPlans.length > 0 ? (
                recentPlans.map((plan, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{plan.patient}</span>
                      <Badge
                        variant={
                          getT(plan.status) ===
                          getT(dashboardTranslations.status.completed)
                            ? "default"
                            : getT(plan.status) ===
                              getT(dashboardTranslations.status.paused)
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {getT(plan.status)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {getT(plan.goal)}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {getT(dashboardTranslations.table.age)}: {plan.age}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground"></div>
                  </div>
                ))
              ) : (
                <EmptyState
                  message={
                    getT(dashboardTranslations.empty.plans) ||
                    "No recent diet plans"
                  }
                />
              )}
            </CardContent>
          </Card>*/}

          {/* Patient Alerts */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {getT(dashboardTranslations.sections.patientAlerts)}
                  </CardTitle>
                  <CardDescription>
                    {language === "fr"
                      ? "Patients avec IMC critique (<17 ou ≥30)"
                      : "Patients with critical BMI (<17 or ≥30)"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className={`p-4 rounded-xl border space-y-2 ${
                        alert.bmi < 17
                          ? "bg-destructive/10 border-destructive/30"
                          : "bg-warning/10 border-warning/30"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{alert.name}</span>
                        <Badge
                          variant={alert.bmi < 17 ? "destructive" : "warning"}
                        >
                          IMC: {alert.bmi.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {getT(dashboardTranslations.table.age)}: {alert.age}
                        </span>
                        <span>
                          {language === "fr" ? "Dernière visite" : "Last visit"}
                          : {alert.lastVisit}
                        </span>
                      </div>
                    </div>
                  ))}
                  <PaginationControls />
                </div>
              ) : (
                <EmptyState
                  message={
                    language === "fr"
                      ? "Aucun patient avec IMC critique"
                      : "No patients with critical BMI"
                  }
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Patient Progress Table */}
        <section>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg">
                {getT(dashboardTranslations.sections.progressTable)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 text-left">
                        <th className="pb-4 font-semibold">
                          {getT(dashboardTranslations.table.name)}
                        </th>
                        <th className="pb-4 font-semibold">
                          {getT(dashboardTranslations.table.age)}
                        </th>

                        <th className="pb-4 font-semibold">
                          {getT(dashboardTranslations.table.startDate)}
                        </th>

                        <th className="pb-4 font-semibold">
                          {getT(dashboardTranslations.table.status)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient, index) => (
                        <tr
                          key={index}
                          className="border-b hover:bg-muted/30 transition-colors duration-150"
                        >
                          <td className="py-4 font-semibold">{patient.name}</td>
                          <td className="py-4 text-muted-foreground">
                            {patient.age}
                          </td>

                          <td className="py-4 text-muted-foreground">
                            {patient.startDate}
                          </td>

                          <td className="py-4">
                            <Badge
                              variant={getStatusBadgeVariant(patient.status)}
                              className={`inline-flex items-center gap-2 ${
                                patient.status.fr
                                  .toLowerCase()
                                  .includes("abandon")
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  patient.status.fr.toLowerCase() === "en cours"
                                    ? "bg-primary"
                                    : patient.status.fr.toLowerCase() ===
                                      "inactif"
                                    ? "bg-warning"
                                    : patient.status.fr.toLowerCase() ===
                                      "reussi"
                                    ? "bg-success"
                                    : patient.status.fr
                                        .toLowerCase()
                                        .includes("abandon")
                                    ? "bg-destructive"
                                    : "bg-muted"
                                }`}
                              />
                              {getT(patient.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  message={
                    getT(dashboardTranslations.empty.patients) ||
                    "No patient progress data available"
                  }
                />
              )}
            </CardContent>
          </Card>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calorie Trend Chart - Takes 3/4 of the width */}
          <Card className="lg:col-span-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {getT(dashboardTranslations.sections.calorieTrend)}
                  </CardTitle>
                  <CardDescription>
                    {getT(dashboardTranslations.sections.calorieTrendDesc)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="day"
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        name={language === "fr" ? "Cibles" : "Target"}
                        strokeDasharray="5 5"
                        dot={{
                          fill: "hsl(var(--primary))",
                          strokeWidth: 2,
                          r: 4,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="hsl(var(--success))"
                        strokeWidth={3}
                        name={language === "fr" ? "Réels" : "Actual"}
                        dot={{
                          fill: "hsl(var(--success))",
                          strokeWidth: 2,
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  message={
                    getT(dashboardTranslations.empty.chart) ||
                    "No calorie trend data available"
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Nutrition Summary - Takes 1/4 of the width */}
          {/* <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="text-center">
                <div className="mx-auto mb-2 p-2 rounded-lg bg-accent/10 w-fit">
                  <Activity className="h-5 w-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">
                  {getT(dashboardTranslations.sections.nutrientAdherence)}
                </CardTitle>
                <CardDescription className="text-xs">
                  {getT(dashboardTranslations.sections.patientAverages)}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: dashboardTranslations.nutrients.protein,
                  value: 85,
                  color: "bg-primary",
                },
                {
                  name: dashboardTranslations.nutrients.carbs,
                  value: 72,
                  color: "bg-success",
                },
                {
                  name: dashboardTranslations.nutrients.fats,
                  value: 68,
                  color: "bg-warning",
                },
                {
                  name: dashboardTranslations.nutrients.fiber,
                  value: 60,
                  color: "bg-accent",
                },
                {
                  name: dashboardTranslations.nutrients.vitaminD,
                  value: 45,
                  color: "bg-muted",
                },
                {
                  name: dashboardTranslations.nutrients.iron,
                  value: 78,
                  color: "bg-destructive",
                },
              ].map((nutrient, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{getT(nutrient.name)}</span>
                    <span className="font-bold text-primary">
                      {nutrient.value}%
                    </span>
                  </div>
                  <Progress value={nutrient.value} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>*/}
        </section>
      </main>
    </div>
  );
}
