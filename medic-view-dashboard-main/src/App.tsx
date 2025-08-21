import { Toaster } from "@/components/component/toaster";
import { Toaster as Sonner } from "@/components/component/sonner";
import { TooltipProvider } from "@/components/component/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import PatientDetail from "@/pages/PatientDetail";
import NotFound from "./pages/NotFound";
import MainLayout from "@/layouts/MainLayout";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { PatientManagement } from "./components/PatientManagement";
import { LanguageProvider } from "@/context/LanguageContext";
import Appointments from "./components/Appointments";
import Login from "./pages/login";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DoctorProfile from "./components/DoctorProfile.js";
import Admin from "./pages/Admin";
import { AdminRoute } from "@/components/AdminRoute";
import AINutritionChatbot from "@/components/aibot.tsx";
import MealPlanner from "@/components/MealPlanner"; // Add this import
const queryClient = new QueryClient();

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="/dashboard" element={<DoctorDashboard />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/profile" element={<DoctorProfile />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/aibot" element={<AINutritionChatbot />} />
        <Route path="/mealplanner" element={<MealPlanner />} /> {/* Add this line */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <Sonner
                  position="top-center"
                  className="max-w-[90vw] sm:max-w-md"
                />
                <AppRoutes />
              </div>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
