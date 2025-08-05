import { Card } from "@/components/ui/card";

interface HealthScoreProps {
  score: number;
  language: "fr" | "en";
}

export function HealthScore({ score, language }: HealthScoreProps) {
  const texts = {
    fr: { title: "Score de Santé" },
    en: { title: "Health Score" },
  };

  const t = texts[language];

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return { color: "hsl(var(--medical-green))", bg: "bg-medical-green/10" };
    if (score >= 60)
      return {
        color: "hsl(var(--medical-yellow))",
        bg: "bg-medical-yellow/10",
      };
    return { color: "hsl(var(--medical-red))", bg: "bg-medical-red/10" };
  };

  const { color, bg } = getScoreColor(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className={`p-6 ${bg} border transition-all hover:shadow-hover`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          {t.title}
        </h3>

        <div className="relative inline-flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">
                {score}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
