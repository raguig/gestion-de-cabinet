import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PatientHeader } from "@/components/PatientHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { OverviewTab } from "@/components/OverviewTab";
import { HistoryTab } from "@/components/HistoryTab";
import { DietEditorTab } from "@/components/DietEditorTab";
import TrainingTab from "../components/TrainingTab";
import { useLanguage } from "@/context/LanguageContext";

export default function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<
    "apercu" | "historique" | "editeur" | "entrainement"
  >("apercu");
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const fetchPatientData = async () => {
    if (!id) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      // Fetch both patient and visits data concurrently
      const [patientRes, visitsRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8000/api/patients/visit/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPatient(patientRes.data);
      setVisits(visitsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to refresh all patient data
  const refreshData = async () => {
    if (!id) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      // Fetch both patient and visits data concurrently
      const [patientRes, visitsRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8000/api/patients/visit/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPatient(patientRes.data);
      setVisits(visitsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "apercu":
        return (
          <OverviewTab
            language={language}
            patient={patient}
            visits={visits}
            onVisitAdded={refreshData}
          />
        );
      case "historique":
        return <HistoryTab language={language} visits={visits} />;
      case "editeur":
        const latestVisitId =
          visits.length > 0 ? visits[visits.length - 1]._id : null;
        return (
          <DietEditorTab
            language={language}
            patient={patient}
            visitId={latestVisitId}
            onDietAssigned={refreshData} // Add this prop
          />
        );
      case "entrainement":
        return <TrainingTab patient={patient} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/patients")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Retour à la liste des patients</span>
        </button>

        <div className="space-y-6">
          <PatientHeader language={language} patient={patient} />
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            language={language}
            // If you pass a tabs prop, add "entrainement" here
            // tabs={["apercu", "historique", "editeur", "entrainement"]}
          />
          <div className="transition-all duration-300 ease-in-out">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
