import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MacroData {
  name: string;
  target: number;
  consumed: number;
  unit: string;
  color: string;
}

interface MacroProgressProps {
  language: "fr" | "en";
}

export function MacroProgress({ language }: MacroProgressProps) {
  const texts = {
    fr: {
      title: "Objectif Macro VS Régime",
      macro: "Macro",
      target: "Objectif",
      consumed: "Consommé",
      proteins: "Protéines",
      carbs: "Glucides",
      fats: "Lipides",
    },
    en: {
      title: "Macro Target VS Diet",
      macro: "Macro",
      target: "Target",
      consumed: "Consumed",
      proteins: "Proteins",
      carbs: "Carbs",
      fats: "Fats",
    },
  };

  const t = texts[language];

  const macros: MacroData[] = [
    {
      name: t.proteins,
      target: 120,
      consumed: 105,
      unit: "g",
      color: "hsl(var(--medical-blue))",
    },
    {
      name: t.carbs,
      target: 200,
      consumed: 185,
      unit: "g",
      color: "hsl(var(--medical-orange))",
    },
    {
      name: t.fats,
      target: 70,
      consumed: 60,
      unit: "g",
      color: "hsl(var(--medical-green))",
    },
  ];

  return (
    <Card className="p-6 bg-card shadow-card border-border transition-all hover:shadow-hover">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{t.title}</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
          <span>{t.macro}</span>
          <span>{t.target}</span>
          <span>{t.consumed}</span>
        </div>

        {macros.map((macro) => (
          <div key={macro.name} className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <span className="font-medium text-foreground">{macro.name}</span>
              <span className="text-muted-foreground">
                {macro.target}
                {macro.unit}
              </span>
              <span className="font-medium text-foreground">
                {macro.consumed}
                {macro.unit}
              </span>
            </div>

            <div className="w-full">
              <Progress
                value={(macro.consumed / macro.target) * 100}
                className="h-2"
                style={
                  {
                    "--progress-background": macro.color,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
