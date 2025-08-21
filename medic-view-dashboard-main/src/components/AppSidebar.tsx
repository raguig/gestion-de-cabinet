import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users2,
  Calendar,
  User,
  Shield,
  LogOut,
  Bot,
  ChevronLeft,
  ChevronRight,
  Utensils, // Add this import
} from "lucide-react";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

// Translation object for sidebar
const sidebarTranslations = {
  navigation: {
    dashboard: { fr: "Tableau de bord", en: "Dashboard" },
    appointments: { fr: "Rendez-vous", en: "Appointments" },
    patients: { fr: "Patients", en: "Patients" },
    profile: { fr: "Profil", en: "Profile" },
    administration: { fr: "Administration", en: "Administration" },
    logout: { fr: "Déconnexion", en: "Logout" },
    aiAssistant: { fr: "Assistant IA", en: "AI Assistant" },
    mealPlanner: { fr: "Planificateur de repas", en: "Meal Planner" }, // Add translation
  },
  branding: {
    title: { fr: "Gestion", en: "Management" },
    subtitle: { fr: "Cabinet", en: "Clinic" },
  },
};

export default function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { logout, user, loading } = useAuth();
  const { language } = useLanguage();
  const isCollapsed = state === "collapsed";

  // Helper function to get translation
  const getT = (obj: { fr: string; en: string } | undefined) => {
    if (!obj) return "";
    return obj[language] || obj.fr || "";
  };

  const navigation = [
    {
      title: getT(sidebarTranslations.navigation.dashboard),
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: getT(sidebarTranslations.navigation.appointments),
      url: "/appointments",
      icon: Calendar,
    },
    {
      title: getT(sidebarTranslations.navigation.patients),
      url: "/patients",
      icon: Users2,
    },
    {
      title: getT(sidebarTranslations.navigation.aiAssistant),
      url: "/aibot",
      icon: Bot,
    },
    {
      title: getT(sidebarTranslations.navigation.mealPlanner),
      url: "/mealplanner",
      icon: Utensils, // Change this line
    },
    {
      title: getT(sidebarTranslations.navigation.profile),
      url: "/profile",
      icon: User,
    },
    // Make admin route conditional
    ...(user?.isAdmin
      ? [
          {
            title: getT(sidebarTranslations.navigation.administration),
            url: "/admin",
            icon: Shield,
          },
        ]
      : []),
  ];

  if (loading) {
    return null;
  }

  return (
    <aside
      className={`h-screen ${
        isCollapsed ? "w-20" : "w-72"
      } bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out flex flex-col fixed left-0 top-0 z-50 border-r border-gray-100 dark:border-gray-800`}
    >
      {/* Header with Logo and Toggle */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100/50 dark:border-gray-800/50">
        <div
          className={`flex items-center gap-4 ${
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          } transition-all duration-300`}
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
            <img
              src="/logoNutri.png"
              alt="Logo NutriDoc"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text whitespace-nowrap dark:from-primary dark:to-primary/60">
            NutriDoc
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? (
            <ChevronRight
              className="h-6 w-6 text-gray-400 dark:text-gray-300 hover:text-primary transition-colors"
              strokeWidth={1.5}
            />
          ) : (
            <ChevronLeft
              className="h-6 w-6 text-gray-400 dark:text-gray-300 hover:text-primary transition-colors"
              strokeWidth={1.5}
            />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2.5">
          {navigation.map((item) => (
            <li key={item.url} className="relative">
              <NavLink
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl hover:text-primary hover:bg-white dark:hover:bg-gray-900 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-200 group relative ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-white dark:bg-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-primary"
                      : "text-gray-500 dark:text-gray-300"
                  }`
                }
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon
                  className={`h-6 w-6 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg]`}
                  strokeWidth={1.5}
                />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap tracking-wide flex-1">
                    {item.title}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with Settings and Logout */}
      <div className="border-t border-gray-100/50 dark:border-gray-800/50 mt-auto">
        <div className="p-4">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <button
              onClick={logout}
              className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-500 dark:hover:text-red-400 hover:scale-110 hover:shadow-lg hover:rotate-[8deg] text-gray-400 dark:text-gray-300"
              title="Logout"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
