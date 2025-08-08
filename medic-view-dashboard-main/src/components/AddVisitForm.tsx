import { useState } from "react";
import { cn } from "@/lib/utils";

interface AddVisitFormProps {
  patientId: string;
  onSubmit: (visitData: {
    weight: number;
    bf: number;
    healthScore: number;
    rythm: number;
    goal: string;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AddVisitForm({
  patientId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AddVisitFormProps) {
  const [formData, setFormData] = useState({
    weight: "",
    bf: "",
    healthScore: "",
    rythm: "0.25",
    goal: "weight loss",
  });

  // Add validation state
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const rythmOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = () => {
    const { weight, bf, healthScore, rythm, goal } = formData;

    // Validate fields
    const newErrors: Record<string, boolean> = {};
    if (!weight) newErrors.weight = true;
    if (!bf) newErrors.bf = true;
    if (!healthScore) newErrors.healthScore = true;
    if (!rythm) newErrors.rythm = true;
    if (!goal) newErrors.goal = true;

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      weight: parseFloat(weight),
      bf: parseFloat(bf),
      healthScore: parseFloat(healthScore),
      rythm: parseFloat(rythm),
      goal: goal,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add New Visit</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            className={cn(
              "mt-1 block w-full border-2 rounded-md shadow-sm transition-colors",
              errors.weight
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            disabled={isSubmitting}
          />
          {errors.weight && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Body Fat (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.bf}
            onChange={(e) => handleInputChange("bf", e.target.value)}
            className={cn(
              "mt-1 block w-full border-2 rounded-md shadow-sm transition-colors",
              errors.bf
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            disabled={isSubmitting}
          />
          {errors.bf && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Health Score <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.healthScore}
            onChange={(e) => handleInputChange("healthScore", e.target.value)}
            className={cn(
              "mt-1 block w-full border-2 rounded-md shadow-sm transition-colors",
              errors.healthScore
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            disabled={isSubmitting}
          />
          {errors.healthScore && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rythm <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.rythm}
            onChange={(e) => handleInputChange("rythm", e.target.value)}
            className={cn(
              "mt-1 block w-full border-2 rounded-md shadow-sm h-12 px-4 transition-colors",
              errors.rythm
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            disabled={isSubmitting}
          >
            {rythmOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          {errors.rythm && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Goal <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.goal}
            onChange={(e) => handleInputChange("goal", e.target.value)}
            className={cn(
              "w-full h-12 px-4 rounded-xl border-2 transition-colors",
              errors.goal
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
              "dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
            )}
            disabled={isSubmitting}
          >
            <option value="weight loss">Perte de poids</option>
            <option value="muscle gain">Gain de masse musculaire</option>
            <option value="maintenance">Maintenance</option>
          </select>
          {errors.goal && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          disabled={isSubmitting}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
