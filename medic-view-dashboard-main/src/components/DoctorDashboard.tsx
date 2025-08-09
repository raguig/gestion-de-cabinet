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
    status: { fr: string; en: string };
    lastVisit: string;
    nextVisit: string;
  }[];
  weeklyStats: {
    day: string;
    actual: number;
    target: number;
  }[];
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

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update your fetch function to handle missing data
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get("import.meta.env.VITE_BACKEND_URL/api/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  // Update the getT function to handle undefined values
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 space-y-8">
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

        {/* Overview Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
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
            <CardContent className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((apt, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{apt.name}</span>
                      <Badge variant="outline" className="font-medium">
                        {apt.time}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{apt.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{getT(apt.location)}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {getT(apt.objective)}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{getT(apt.type)}</span>
                      <span>{apt.duration}</span>
                    </div>
                  </div>
                ))
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
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
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
          </Card>

          {/* Patient Alerts */}
          {/* <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <CardTitle className="text-lg">
                  {getT(dashboardTranslations.sections.patientAlerts)}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border space-y-2 ${
                    alert.priority === "high"
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-warning/10 border-warning/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{alert.patient}</span>
                    <Badge
                      variant={
                        alert.priority === "high" ? "destructive" : "outline"
                      }
                    >
                      {alert.priority === "high"
                        ? getT(dashboardTranslations.alerts.urgent)
                        : getT(dashboardTranslations.alerts.medium)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {getT(alert.issue)}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {getT(dashboardTranslations.table.age)}: {alert.age}
                    </span>
                    <span>
                      {getT(dashboardTranslations.alerts.lastContact)}:{" "}
                      {alert.lastContact}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>*/}
        </section>

        {/* Chart and Nutrition Summary Side by Side */}
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
                              variant={
                                getT(patient.status) ===
                                getT(dashboardTranslations.status.stable)
                                  ? "default"
                                  : "secondary"
                              }
                            >
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
      </main>
    </div>
  );
}
