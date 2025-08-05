import { User, Calendar, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PatientHeaderProps {
  language: "fr" | "en";
  patient?: any;
}

export function PatientHeader({ language, patient }: PatientHeaderProps) {
  const texts = {
    fr: {
      fullName: "Nom complet",
      age: "Âge",
      lastMeasure: "Dernière mesure",
    },
    en: {
      fullName: "Full Name",
      age: "Age",
      lastMeasure: "Last Measure",
    },
  };

  const t = texts[language];

  // Helper to calculate age
  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "-";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Full Name */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.fullName}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {patient ? `${patient.firstname} ${patient.lastname}` : "-"}
              </p>
            </div>
          </div>

          {/* Age */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.age}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {patient && patient.dateOfBirth
                  ? `${getAge(patient.dateOfBirth)} ${
                      language === "fr" ? "ans" : "years"
                    }`
                  : "-"}
              </p>
            </div>
          </div>

          {/* Last Measure */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 bg-teal-50 dark:bg-teal-900 rounded-lg">
              <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.lastMeasure}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {patient && patient.lastmeasurement
                  ? new Date(patient.lastmeasurement).toLocaleDateString(
                      language
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
