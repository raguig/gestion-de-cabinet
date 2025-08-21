import { Input } from "@/components/component/input.tsx";
import { Button } from "@/components/component/button.tsx";
import { X, Save } from "lucide-react";
import { Activity, TrendingUp, HelpCircle } from "lucide-react";
import type {
  Patient,
  Language,
  Gender,
  ActivityLevel,
  Goal,
} from "./PatientManagement.tsx";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const rhythmOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
const activityMultipliers = {
  faible: 1.2,
  moderee: 1.55,
  elevee: 1.725,
};

interface PatientFormProps {
  patient: Partial<Patient> & { rhythm?: number }; // Add explicit typing for rhythm
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
        rhythm: 0, // Set to 0 for maintenance
        pathalogie: "",
        allergie: "",
      });
    }
  }, [isEdit]);

  // Add this effect to handle goal changes
  useEffect(() => {
    if (patient.goal === "maintenance") {
      onChange({ ...patient, rhythm: 0 });
    } else if (patient.rhythm === 0) {
      onChange({ ...patient, rhythm: 0.5 }); // Reset to default if changing from maintenance
    }
  }, [patient.goal]);

  // Modify the form submission
  // Modify the handleSubmit function
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required fields
    const newErrors: Record<string, boolean> = {};
    if (!patient.firstName?.trim()) newErrors.firstName = true;
    if (!patient.lastName?.trim()) newErrors.lastName = true;
    if (!patient.birthDate) newErrors.birthDate = true;
    if (!patient.height) newErrors.height = true;
    if (!patient.weight) newErrors.weight = true;
    if (!patient.rhythm && patient.goal !== "maintenance")
      newErrors.rhythm = true;
    if (!patient.bf) newErrors.bf = true;
    if (!patient.targetWeight && patient.goal !== "maintenance")
      newErrors.targetWeight = true;

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
                if (nameRegex.test(e.target.value) || e.target.value === "") {
                  onChange({ ...patient, firstName: e.target.value });
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: false });
                  }
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
                if (nameRegex.test(e.target.value) || e.target.value === "") {
                  onChange({ ...patient, lastName: e.target.value });
                  if (errors.lastName) {
                    setErrors({ ...errors, lastName: false });
                  }
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
              max={new Date().toISOString().split("T")[0]}
              className={cn(
                errors.birthDate &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              placeholder="JJ/MM/AAAA"
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
                const value = Number(e.target.value);
                if (value >= 0 && value <= 300) {
                  onChange({ ...patient, height: value });
                  if (errors.height) {
                    setErrors({ ...errors, height: false });
                  }
                }
              }}
              min="0"
              max="300"
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
                const value = Number(e.target.value);
                if (value >= 0 && value <= 200) {
                  onChange({ ...patient, weight: value });
                  if (errors.weight) {
                    setErrors({ ...errors, weight: false });
                  }
                }
              }}
              min="0"
              max="200"
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
              {getText("Masse Grasse")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={patient.bf || ""}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 100) {
                  onChange({ ...patient, bf: value });
                  if (errors.bf) {
                    setErrors({ ...errors, bf: false });
                  }
                }
              }}
              min="0"
              max="100"
              placeholder="15"
              className={cn(
                errors.bf &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                "transition-colors"
              )}
            />
            {errors.bf && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("Score de Santé")}
            </label>
            <Input
              type="number"
              value={patient.healthScore || ""} // Display the current value of healthScore
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 100) {
                  onChange({ ...patient, healthScore: value });
                }
              }}
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
              type="text"
              value={patient.pathalogie || ""}
              onChange={(e) => {
                if (nameRegex.test(e.target.value) || e.target.value === "") {
                  onChange({ ...patient, pathalogie: e.target.value });
                }
              }}
              className="w-full h-12 px-4 rounded-xl dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("allergie")}
            </label>
            <Input
              type="text"
              value={patient.allergie || ""}
              onChange={(e) => {
                if (nameRegex.test(e.target.value) || e.target.value === "") {
                  onChange({ ...patient, allergie: e.target.value });
                }
              }}
              className="w-full h-12 px-4 rounded-xl dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Health Goals Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Activity Level */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              {getText("activityLevel")}
              <div className="relative group">
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border">
                  <div className="space-y-1">
                    <p>{getText("faible")}: 1.2</p>
                    <p>{getText("moderee")}: 1.55</p>
                    <p>{getText("elevee")}: 1.725</p>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-popover"></div>
                </div>
              </div>
            </label>
            <select
              value={patient.activityLevel || "moderee"}
              onChange={(e) =>
                onChange({
                  ...patient,
                  activityLevel: e.target.value as ActivityLevel,
                })
              }
              className="w-full h-12 px-4 rounded-xl dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="faible">{getText("faible")}</option>
              <option value="moderee">{getText("moderee")}</option>
              <option value="elevee">{getText("elevee")}</option>
            </select>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">{getText("goal")}</label>
            <select
              value={patient.goal || "maintenance"}
              onChange={(e) =>
                onChange({ ...patient, goal: e.target.value as Goal })
              }
              className="w-full h-12 px-4 rounded-xl dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="perte">{getText("perte")}</option>
              <option value="gain">{getText("gain")}</option>
              <option value="maintenance">{getText("maintenance")}</option>
            </select>
          </div>

          {/* Rhythm */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              {getText("rhythmWeek")} <span className="text-red-500">*</span>
            </label>
            <select
              value={
                patient.goal === "maintenance"
                  ? "0"
                  : patient.rhythm?.toString() || "0.5"
              }
              onChange={(e) => {
                onChange({ ...patient, rhythm: Number(e.target.value) });
                if (errors.rhythm) {
                  setErrors({ ...errors, rhythm: false });
                }
              }}
              disabled={patient.goal === "maintenance"}
              className={cn(
                "w-full h-12 px-4 rounded-xl dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100",
                errors.rhythm &&
                  "border-red-500 focus:ring-red-500 dark:border-red-500",
                patient.goal === "maintenance" &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              {patient.goal === "maintenance" ? (
                <option value="0">0 kg/semaine</option>
              ) : (
                <>
                  {rhythmOptions.map((value) => (
                    <option key={value} value={value.toString()}>
                      {value} kg/semaine
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.rhythm && patient.goal !== "maintenance" && (
              <p className="text-xs text-red-500 mt-1">
                {getText("requiredField")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Target Weight - Only show if not maintenance */}
      {patient.goal !== "maintenance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Weight */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {getText("targetWeight")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={patient.targetWeight || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 300) {
                    onChange({ ...patient, targetWeight: value });
                    if (errors.targetWeight) {
                      setErrors({ ...errors, targetWeight: false });
                    }
                  }
                }}
                placeholder="70"
                className={cn(
                  errors.targetWeight &&
                    "border-red-500 focus:ring-red-500 dark:border-red-500",
                  "transition-colors"
                )}
              />
              {errors.targetWeight && (
                <p className="text-xs text-red-500 mt-1">
                  {getText("requiredField")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Selection - Only show when editing */}
      {isEdit && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {getText("status")}
              </label>
              <select
                value={patient.status || "en cours"}
                onChange={(e) =>
                  onChange({
                    ...patient,
                    status: e.target.value as
                      | "inactif"
                      | "en cours"
                      | "reussi"
                      | "abandonne",
                  })
                }
                className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="en cours">{getText("statuses.en cours")}</option>
                <option value="reussi">{getText("statuses.reussi")}</option>
                <option value="inactif">{getText("statuses.inactif")}</option>
                <option value="abandonne">
                  {getText("statuses.abandonne")}
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-8">
        <Button variant="outline" type="button" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {getText("cancel")}
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-primary to-secondary text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {getText("save")}
        </Button>
      </div>
    </form>
  );
}
