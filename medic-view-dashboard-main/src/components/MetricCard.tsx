import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  color?: "blue" | "teal" | "yellow" | "red" | "green" | "orange" | "purple";
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  color = "blue",
}: MetricCardProps) {
  const colorClasses = {
    blue: "bg-medical-blue/10 text-medical-blue border-medical-blue/20",
    teal: "bg-medical-teal/10 text-medical-teal border-medical-teal/20",
    yellow: "bg-medical-yellow/10 text-medical-yellow border-medical-yellow/20",
    red: "bg-medical-red/10 text-medical-red border-medical-red/20",
    green: "bg-medical-green/10 text-medical-green border-medical-green/20",
    orange: "bg-medical-orange/10 text-medical-orange border-medical-orange/20",
  };

  return (
    <Card
      className={`p-4 border ${colorClasses[color]} transition-all hover:shadow-hover`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
        </div>
        {icon && <div className="ml-3 opacity-60">{icon}</div>}
      </div>
    </Card>
  );
}
