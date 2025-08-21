import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  color?: "blue" | "teal" | "yellow" | "red" | "green" | "orange" | "purple";
  subtitle?: string;
  clinicalNote?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  color = "blue",
  subtitle,
  clinicalNote,
}: MetricCardProps) {
  const colorClasses = {
    blue: "bg-medical-blue/10 text-medical-blue border-medical-blue/20",
    teal: "bg-medical-teal/10 text-medical-teal border-medical-teal/20",
    yellow: "bg-medical-yellow/10 text-medical-yellow border-medical-yellow/20",
    red: "bg-medical-red/10 text-medical-red border-medical-red/20",
    green: "bg-medical-green/10 text-medical-green border-medical-green/20",
    orange: "bg-medical-orange/10 text-medical-orange border-medical-orange/20",
    purple: "bg-medical-purple/10 text-medical-purple border-medical-purple/20",
  };

  return (
    <Card
      className={`${colorClasses[color]} transition-all duration-300 hover:shadow-lg transform hover:scale-102 min-w-[200px] h-full`}
    >
      <div className="p-4 sm:p-5 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 break-words leading-tight mb-2">
  {title}
</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon container with responsive sizing */}
          {icon && (
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-current/10 flex items-center justify-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5">{icon}</div>
            </div>
          )}
        </div>

        {/* Value and unit with responsive sizing */}
        <div className="mt-2 flex items-baseline flex-wrap gap-1">
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-sm sm:text-base text-muted-foreground">
              {unit}
            </span>
          )}
        </div>

        {/* Clinical note with responsive visibility */}
        {clinicalNote && (
          <p className="mt-2 text-xs italic text-muted-foreground hidden sm:block">
            {clinicalNote}
          </p>
        )}
      </div>
    </Card>
  );
}
