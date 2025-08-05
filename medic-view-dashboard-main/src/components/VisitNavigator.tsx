import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface VisitNavigatorProps {
  visits: any[];
  language: "fr" | "en";
  onVisitChange: (visit: any) => void;
}

export function VisitNavigator({
  visits,
  language,
  onVisitChange,
}: VisitNavigatorProps) {
  const [currentIndex, setCurrentIndex] = useState(visits.length - 1);
  const currentVisit = visits[currentIndex];
  const locale = language === "fr" ? fr : enUS;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onVisitChange(visits[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < visits.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onVisitChange(visits[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-primary" />
        <div className="text-center">
          <div className="font-medium">
            {format(new Date(currentVisit.visitDate), "PPP", { locale })}
          </div>
          <div className="text-sm text-muted-foreground">
            {language === "fr" ? "Visite" : "Visit"} {currentIndex + 1} /{" "}
            {visits.length}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={currentIndex === visits.length - 1}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
