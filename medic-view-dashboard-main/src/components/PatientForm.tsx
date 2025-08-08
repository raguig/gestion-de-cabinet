import { Input } from "@/components/component/input.tsx";
import { Button } from "@/components/component/button.tsx";
import { X, Save } from "lucide-react";
import { Activity, TrendingUp } from "lucide-react";
import type {
  Patient,
  Language,
  Gender,
  ActivityLevel,
  Goal,
} from "./PatientManagement.tsx";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PatientFormProps {
  patient: Partial<Patient>;
  onChange: (p: Partial<Patient>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  getText: (key: string) => string;
  isEdit?: boolean;
}

export function PatientForm({
  patient,
  onChange,
  onSubmit,
  onCancel,
  getText,
  isEdit = false,
}: PatientFormProps) {
  // Add validation state
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Reset form when opening for a new patient (not editing)
  useEffect(() => {
    if (!isEdit) {
      onChange({
        firstName: "",
        lastName: "",
        gender: "M",
        birthDate: "",
        height: 0,
        weight: 0,
        bf: 0,
        healthScore: 0,
        activityLevel: "moderee",
        goal: "maintenance",
        rhythm: 0,
        pathalogie: "",
        allergie: "",
      });
    }
  }, [isEdit]);

  // Modify the form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required fields
    const newErrors: Record<string, boolean> = {};
    if (!patient.firstName?.trim()) newErrors.firstName = true;
    if (!patient.lastName?.trim()) newErrors.lastName = true;
    if (!patient.birthDate) newErrors.birthDate = true;
    if (!patient.height) newErrors.height = true;
    if (!patient.weight) newErrors.weight = true;
    if (!patient.rhythm) newErrors.rhythm = true;
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any existing errors and submit
    setErrors({});
    onSubmit();
  };

  // Update input fields to show errors
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("firstName")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={patient.firstName || ""}
              onChange={(e) => {
                onChange({ ...patient, firstName: e.target.value });
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: false });
                }
              }}
              placeholder="Prénom du patient"
              className={cn(
                errors.firstName &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("lastName")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={patient.lastName || ""}
              onChange={(e) => {
                onChange({ ...patient, lastName: e.target.value });
                if (errors.lastName) {
                  setErrors({ ...errors, lastName: false });
                }
              }}
              placeholder="Nom de famille"
              className={cn(
                errors.lastName &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold dark:text-gray-100">
              {getText("gender")}
            </label>
            <select
              value={patient.gender || "M"}
              onChange={(e) =>
                onChange({ ...patient, gender: e.target.value as Gender })
              }
              className="w-full h-12 px-4 rounded-xl  dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="M">{getText("male")}</option>
              <option value="F">{getText("female")}</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">
              {getText("birthDate")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={patient.birthDate || ""}
              onChange={(e) => {
                onChange({ ...patient, birthDate: e.target.value });
                if (errors.birthDate) {
                  setErrors({ ...errors, birthDate: false });
                }
              }}
              className={cn(
                errors.birthDate &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
            />
            {errors.birthDate && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Physical Measurements Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("height")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={patient.height || ""}
              onChange={(e) => {
                onChange({ ...patient, height: Number(e.target.value) });
                if (errors.height) {
                  setErrors({ ...errors, height: false });
                }
              }}
              placeholder="170"
              className={cn(
                errors.height &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
            />
            {errors.height && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("weight")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={patient.weight || ""}
              onChange={(e) => {
                onChange({ ...patient, weight: Number(e.target.value) });
                if (errors.weight) {
                  setErrors({ ...errors, weight: false });
                }
              }}
              placeholder="70"
              className={cn(
                errors.weight &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
            />
            {errors.weight && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("Masse Grasse")}
            </label>
            <Input
              type="number"
              value={patient.bf || ""} // Display the current value of bf
              onChange={(e) =>
                onChange({ ...patient, bf: Number(e.target.value) })
              }
              placeholder="15"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("Score de Santé")}
            </label>
            <Input
              type="number"
              value={patient.healthScore || ""} // Display the current value of healthScore
              onChange={(e) =>
                onChange({ ...patient, healthScore: Number(e.target.value) })
              }
              placeholder="80"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("pathalogie")}
            </label>
            <Input
              type="string"
              value={patient.pathalogie || ""}
              onChange={(e) =>
                onChange({ ...patient, pathalogie: String(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("allergie")}
            </label>
            <Input
              type="string"
              value={patient.allergie || ""}
              onChange={(e) =>
                onChange({ ...patient, allergie: String(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      {/* Health Goals Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("activityLevel")}
            </label>
            <select
              value={patient.activityLevel || "moderee"}
              onChange={(e) =>
                onChange({
                  ...patient,
                  activityLevel: e.target.value as ActivityLevel,
                })
              }
              className="w-full h-12 px-4 rounded-xl  dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="faible">{getText("faible")}</option>
              <option value="moderee">{getText("moderee")}</option>
              <option value="elevee">{getText("elevee")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">{getText("goal")}</label>
            <select
              value={patient.goal || "maintenance"}
              onChange={(e) =>
                onChange({ ...patient, goal: e.target.value as Goal })
              }
              className="w-full h-12 px-4 rounded-xl  dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="perte">{getText("perte")}</option>
              <option value="gain">{getText("gain")}</option>
              <option value="maintenance">{getText("maintenance")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("rhythmWeek")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1.5"
              value={patient.rhythm || ""}
              onChange={(e) => {
                onChange({ ...patient, rhythm: Number(e.target.value) });
                if (errors.rhythm) {
                  setErrors({ ...errors, rhythm: false });
                }
              }}
              placeholder="0.5"
              className={cn(
                errors.rhythm &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
            />
            {errors.rhythm && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-8">
        <Button variant="outline" type="button" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {getText("cancel")}
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {getText("save")}
        </Button>
      </div>
    </form>
  );
}
