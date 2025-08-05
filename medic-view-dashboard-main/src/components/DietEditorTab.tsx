import { DietEditorSlide } from "./DietEditorSlide";

interface DietEditorTabProps {
  language: "fr" | "en";
  patient: any; // Add the patient prop
  visitId: string | null; // Add visitId as a prop
  onDietAssigned?: () => void; // Add this prop
}

export function DietEditorTab({
  language,
  patient,
  visitId,
  onDietAssigned,
}: DietEditorTabProps) {
  console.log("patient in DietEditorTab: ", patient);
  const calorieintake = patient?.latestVisit[0]?.calorieintake; // Fallback to 0 if undefined
  console.log("calorieintake: ", calorieintake);
  return (
    <DietEditorSlide
      language={language}
      calorieintake={calorieintake}
      visitId={visitId || ""}
      onDietAssigned={onDietAssigned}
      patient={patient} // Pass the prop
    />
  );
}
