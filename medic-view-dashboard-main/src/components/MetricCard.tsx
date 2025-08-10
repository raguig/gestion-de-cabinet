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
      className={`relative overflow-hidden ${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:scale-102 group`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Icon container - Responsive sizing and positioning */}
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-current/10 flex items-center justify-center transition-transform group-hover:scale-110">
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-current">
              {icon}
            </div>
          </div>
        )}

        {/* Content container - Flexible layout */}
        <div className="flex-1 min-w-0">
          {/* Title - Responsive text size */}
          <h3 className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground truncate mb-1">
            {title}
          </h3>

          {/* Value and Unit - Responsive sizing */}
          <div className="flex items-baseline flex-wrap gap-1">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
              {value}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>

          {/* Optional subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}

          {/* Optional clinical note */}
          {clinicalNote && (
            <p className="text-xs italic text-muted-foreground mt-2 hidden sm:block">
              {clinicalNote}
            </p>
          )}
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-current/5 pointer-events-none" />
    </Card>
  );
}
