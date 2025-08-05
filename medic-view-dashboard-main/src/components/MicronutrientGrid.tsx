import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NutrientData {
  name: string;
  status: "low" | "ok" | "high";
}

interface MicronutrientGridProps {
  language: "fr" | "en";
}

export function MicronutrientGrid({ language }: MicronutrientGridProps) {
  const texts = {
    fr: {
      title: "Niveau de Micronutriments",
      low: "Bas",
      ok: "OK",
      high: "Élevé",
      sodium: "Sodium",
      vitaminA: "Vitamine A",
      calcium: "Calcium",
      vitaminD: "Vitamine D",
      potassium: "Potassium",
      vitaminC: "Vitamine C",
      iron: "Fer",
      zinc: "Zinc",
    },
    en: {
      title: "Micronutrient Levels",
      low: "Low",
      ok: "OK",
      high: "High",
      sodium: "Sodium",
      vitaminA: "Vitamin A",
      calcium: "Calcium",
      vitaminD: "Vitamin D",
      potassium: "Potassium",
      vitaminC: "Vitamin C",
      iron: "Iron",
      zinc: "Zinc",
    },
  };

  const t = texts[language];

  const nutrients: NutrientData[] = [
    { name: t.sodium, status: "ok" },
    { name: t.vitaminA, status: "high" },
    { name: t.calcium, status: "ok" },
    { name: t.vitaminD, status: "low" },
    { name: t.potassium, status: "high" },
    { name: t.vitaminC, status: "high" },
    { name: t.iron, status: "ok" },
    { name: t.zinc, status: "low" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "low":
        return {
          label: t.low,
          className:
            "bg-medical-red/10 text-medical-red border-medical-red/20 hover:bg-medical-red/20",
        };
      case "ok":
        return {
          label: t.ok,
          className:
            "bg-medical-yellow/10 text-medical-yellow border-medical-yellow/20 hover:bg-medical-yellow/20",
        };
      case "high":
        return {
          label: t.high,
          className:
            "bg-medical-green/10 text-medical-green border-medical-green/20 hover:bg-medical-green/20",
        };
      default:
        return {
          label: t.ok,
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  return (
    <Card className="p-6 bg-card shadow-card border-border transition-all hover:shadow-hover">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{t.title}</h3>

      <div className="grid grid-cols-2 gap-3">
        {nutrients.map((nutrient) => {
          const statusConfig = getStatusConfig(nutrient.status);
          return (
            <div
              key={nutrient.name}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <span className="font-medium text-foreground text-sm">
                {nutrient.name}
              </span>
              <Badge
                variant="outline"
                className={`font-medium text-xs ${statusConfig.className}`}
              >
                {statusConfig.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
