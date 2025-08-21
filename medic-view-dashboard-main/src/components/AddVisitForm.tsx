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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const rythmOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleInputChange = (field: string, value: string) => {
    let validatedValue = value;
    let error = "";

    // Validate weight (0-200)
    if (field === "weight") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 200) {
        error = "Weight must be between 0 and 200 kg";
      }
    }

    // Validate body fat (0-100)
    if (field === "bf") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        error = "Body fat must be between 0 and 100%";
      }
    }

    setFormData((prev) => ({ ...prev, [field]: validatedValue }));
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    const { weight, bf, healthScore, rythm, goal } = formData;

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!weight) newErrors.weight = "Weight is required";
    if (!bf) newErrors.bf = "Body fat is required";
    if (!rythm) newErrors.rythm = "Rhythm is required";
    if (!goal) newErrors.goal = "Goal is required";

    // Additional numeric validations
    const weightNum = parseFloat(weight);
    const bfNum = parseFloat(bf);

    if (weightNum < 0 || weightNum > 200) {
      newErrors.weight = "Weight must be between 0 and 200 kg";
    }
    if (bfNum < 0 || bfNum > 100) {
      newErrors.bf = "Body fat must be between 0 and 100%";
    }

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      weight: weightNum,
      bf: bfNum,
      healthScore: healthScore ? parseFloat(healthScore) : 0, // Make healthScore optional
      rythm: parseFloat(rythm),
      goal: goal,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add New Visit</h2>
      <div className="space-y-4">
        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            className={cn(
              "mt-1 block w-full border-2 rounded-md shadow-sm transition-colors",
              errors.weight
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-primary focus:border-primary"
            )}
            disabled={isSubmitting}
          />
          {errors.weight && (
            <p className="text-xs text-red-500 mt-1">{errors.weight}</p>
          )}
        </div>

        {/* Body Fat Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Body Fat (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.bf}
            onChange={(e) => handleInputChange("bf", e.target.value)}
            className={cn(
              "mt-1 block w-full border-2 rounded-md shadow-sm transition-colors",
              errors.bf
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-primary focus:border-primary"
            )}
            disabled={isSubmitting}
          />
          {errors.bf && (
            <p className="text-xs text-red-500 mt-1">{errors.bf}</p>
          )}
        </div>

        {/* Health Score Input (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Health Score
          </label>
          <input
            type="number"
            value={formData.healthScore}
            onChange={(e) => handleInputChange("healthScore", e.target.value)}
            className="mt-1 block w-full border-2 rounded-md shadow-sm border-gray-300 focus:ring-primary focus:border-primary"
            disabled={isSubmitting}
          />
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
                : "border-gray-300 focus:ring-primary focus:border-primary"
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
                : "border-gray-300 focus:ring-primary focus:border-primary",
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
          className="px-4 py-2 bg-primary hover:bg-primary text-white rounded-md transition-colors"
          disabled={isSubmitting}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
