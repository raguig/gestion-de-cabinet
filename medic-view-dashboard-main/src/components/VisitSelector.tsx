import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface VisitSelectorProps {
  visits: any[];
  currentVisitIndex: number;
  onVisitChange: (index: number) => void;
  language: "fr" | "en";
}

export function VisitSelector({
  visits,
  currentVisitIndex,
  onVisitChange,
  language,
}: VisitSelectorProps) {
  if (!visits.length) return null;

  const currentVisit = visits[currentVisitIndex];
  const locale = language === "fr" ? fr : enUS;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onVisitChange(currentVisitIndex - 1)}
        disabled={currentVisitIndex === 0}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <div className="text-center">
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {format(new Date(currentVisit.visitDate), "PPP", { locale })}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {language === "fr" ? "Visite" : "Visit"} {currentVisitIndex + 1} / {visits.length}
        </div>
      </div>

      <button
        onClick={() => onVisitChange(currentVisitIndex + 1)}
        disabled={currentVisitIndex === visits.length - 1}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}