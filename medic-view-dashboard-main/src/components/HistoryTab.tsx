import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";

interface HistoryTabProps {
  language: "fr" | "en";
  visits: Array<{
    visitDate: string;
    weight: number;
    bmi: number;
    calorieintake: number;
    basemetabolisme: number;
    activemetabolisme: number;
  }>;
}

export function HistoryTab({ language, visits }: HistoryTabProps) {
  const texts = {
    fr: {
      weightBMI: "Poids & IMC dans le temps",
      caloriesMass: "Apport Calorique vs Métabolisme",
      weight: "Poids",
      bmi: "IMC",
      calories: "Calories",
      basemet: "Métabolisme de Base",
      activemet: "Métabolisme Actif",
      day: "Jour",
    },
    en: {
      weightBMI: "Weight & BMI Over Time",
      caloriesMass: "Caloric Intake vs Metabolism",
      weight: "Weight",
      bmi: "BMI",
      calories: "Calories",
      basemet: "Base Metabolism",
      activemet: "Active Metabolism",
      day: "Day",
    },
  };

  const t = texts[language];

  // Transform visits data for charts
  const chartData = visits.map((visit) => ({
    day: new Date(visit.visitDate).toLocaleDateString(
      language === "fr" ? "fr-FR" : "en-US"
    ),
    weight: visit.weight,
    bmi: visit.bmi,
    calorieintake: visit.calorieintake,
    basemetabolisme: visit.basemetabolisme,
    activemetabolisme: visit.activemetabolisme,
  }));

  // Handle case where there are no visits
  if (chartData.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-card shadow-card border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {language === "fr"
              ? "Aucune donnée disponible"
              : "No data available"}
          </h3>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weight & BMI Chart */}
      <Card className="p-6 bg-card shadow-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          {t.weightBMI}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="day" className="text-muted-foreground text-sm" />
            <YAxis className="text-muted-foreground text-sm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--medical-blue))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--medical-blue))", strokeWidth: 2, r: 4 }}
              name={`${t.weight} (kg)`}
            />
            <Line
              type="monotone"
              dataKey="bmi"
              stroke="hsl(var(--medical-green))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--medical-green))", strokeWidth: 2, r: 4 }}
              name={t.bmi}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Caloric Intake vs Metabolism Chart */}
      <Card className="p-6 bg-card shadow-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          {t.caloriesMass}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="day" className="text-muted-foreground text-sm" />
            <YAxis className="text-muted-foreground text-sm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="calorieintake"
              stroke="hsl(var(--medical-yellow))"
              fill="hsl(var(--medical-yellow))"
              fillOpacity={0.6}
              name={t.calories}
            />
            <Line
              type="monotone"
              dataKey="basemetabolisme"
              stroke="hsl(var(--medical-teal))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--medical-teal))", strokeWidth: 2, r: 4 }}
              name={t.basemet}
            />
            <Line
              type="monotone"
              dataKey="activemetabolisme"
              stroke="hsl(var(--medical-orange))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--medical-orange))", strokeWidth: 2, r: 4 }}
              name={t.activemet}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
