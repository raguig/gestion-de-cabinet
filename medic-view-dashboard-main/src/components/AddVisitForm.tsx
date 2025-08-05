import { useState } from "react";

interface AddVisitFormProps {
  patientId: string;
  onSubmit: (visitData: {
    weight: number;
    bf: number;
    healthScore: number;
    rythm: number; // Added rythm to visit data
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
    rythm: "1", // Default value for rythm
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const { weight, bf, healthScore, rythm } = formData;
    if (!weight || !bf || !healthScore || !rythm) {
      alert("All fields are required.");
      return;
    }

    onSubmit({
      weight: parseFloat(weight),
      bf: parseFloat(bf),
      healthScore: parseFloat(healthScore),
      rythm: parseFloat(rythm),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add New Visit</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (kg)
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Body Fat (%)
          </label>
          <input
            type="number"
            value={formData.bf}
            onChange={(e) => handleInputChange("bf", e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Health Score
          </label>
          <input
            type="number"
            value={formData.healthScore}
            onChange={(e) => handleInputChange("healthScore", e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rythm (0 to 1.5)
          </label>
          <input
            type="number"
            value={formData.rythm}
            onChange={(e) => handleInputChange("rythm", e.target.value)}
            min="0"
            max="1.5"
            step="0.1"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={isSubmitting}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
