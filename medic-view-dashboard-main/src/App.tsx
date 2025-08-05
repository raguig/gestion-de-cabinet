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
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DoctorProfile from "./components/DoctorProfile.js";
import Admin from "./pages/Admin";
import { AdminRoute } from "@/components/AdminRoute";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
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
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
