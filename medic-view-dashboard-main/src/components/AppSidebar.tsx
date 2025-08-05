import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users2,
  Calendar,
  User,
  Shield,
  LogOut,
} from "lucide-react";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

// Translation object for sidebar
const sidebarTranslations = {
  navigation: {
    dashboard: { fr: "Tableau de bord", en: "Dashboard" },
    appointments: { fr: "Rendez-vous", en: "Appointments" },
    patients: { fr: "Patients", en: "Patients" },
    profile: { fr: "Profil", en: "Profile" },
    administration: { fr: "Administration", en: "Administration" },
    logout: { fr: "Déconnexion", en: "Logout" },
  },
  branding: {
    title: { fr: "Gestion", en: "Management" },
    subtitle: { fr: "Cabinet", en: "Clinic" },
  },
};

export default function AppSidebar() {
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const { language } = useLanguage();
  const isCollapsed = state === "collapsed";

  // Helper function to get translation (same pattern as DoctorDashboard)
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
      title: getT(sidebarTranslations.navigation.profile),
      url: "/profile",
      icon: User,
    },
    {
      title: getT(sidebarTranslations.navigation.administration),
      url: "/admin",
      icon: Shield,
    },
  ];

  const filteredNavigation = navigation.filter((item) => {
    // Only show admin link if user is admin
    if (item.url === "/admin") {
      return user?.isAdmin;
    }
    return true;
  });

  return (
    <Sidebar className="w-64 min-h-screen h-full border-none bg-gradient-to-b from-background to-muted/20">
      <SidebarContent className="py-8 px-3 flex flex-col h-full">
        {/* Logo Section */}
        <div className="mb-12 px-3">
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-lg">
                G
              </span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-foreground">
                  {getT(sidebarTranslations.branding.title)}
                </h2>
                <p className="text-xs text-muted-foreground -mt-1">
                  {getT(sidebarTranslations.branding.subtitle)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-3 flex-grow">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                `group flex items-center px-3 py-4 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-4 font-medium text-sm tracking-wide">
                  {item.title}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button - Added at the bottom */}
        <button
          onClick={logout}
          className="group flex items-center px-3 py-4 rounded-2xl transition-all duration-300 text-red-500 hover:bg-red-50 hover:text-red-600 mt-auto"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-4 font-medium text-sm tracking-wide">
              {getT(sidebarTranslations.navigation.logout)}
            </span>
          )}
        </button>
      </SidebarContent>
    </Sidebar>
  );
}
