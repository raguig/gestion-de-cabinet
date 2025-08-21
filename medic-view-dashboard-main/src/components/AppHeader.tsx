import { useState, useEffect } from "react";
import { Moon, Sun, Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Microscope, HeartPulse } from "lucide-react";
import useDoctor from "./useDoctor";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

const getSubscriptionStyle = (tier: string) => {
  switch (tier) {
    case "premium":
      return "from-amber-500/20 to-yellow-500/20 text-amber-500 border-amber-500";
    case "pro":
      return "from-slate-400/20 to-zinc-300/20 text-slate-300 border-slate-300";
    default: // essentiel
      return "from-gray-500/20 to-zinc-500/20 text-gray-400 border-gray-400";
  }
};

const getSubscriptionLabel = (tier: string) => {
  switch (tier) {
    case "premium":
      return "Gold";
    case "pro":
      return "Platinum";
    default:
      return "Silver";
  }
};

export function AppHeader() {
  const { language, toggleLanguage } = useLanguage();
  const { user, loading: authLoading, logout } = useAuth();
  const { doctor, isLoading, error, refetch } = useDoctor();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isDark, setIsDark] = useState(false);

  // Refetch doctor data when user changes
  useEffect(() => {
    if (user?._id) {
      refetch();
    }
  }, [user?._id]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <header className={`fixed top-0 ${isCollapsed ? "left-20" : "left-72"} right-0 z-40 
        bg-white dark:bg-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.03)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] border-b border-gray-100 dark:border-gray-800
        transition-all duration-300 ease-in-out`}>
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-primary/10 dark:bg-primary/20 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 ${isCollapsed ? "left-20" : "left-72"} right-0 z-40 
      bg-white dark:bg-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.03)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] border-b border-gray-100 dark:border-gray-800
      transition-all duration-300 ease-in-out`}>
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center transition-transform duration-300 hover:scale-110 group-hover:rotate-[8deg]">
            {doctor?.gender === "female" ? (
              <HeartPulse className="h-6 w-6 text-primary" />
            ) : (
              <Microscope className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {error
                ? "Error loading profile"
                : doctor
                ? `Dr. ${doctor.firstname} ${doctor.lastname}`
                : "Doctor Profile"}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {doctor?.specialty || "Specialty"}
              </span>
              {doctor?.subscription?.tier && (
                <Badge
                  variant="outline"
                  className={`bg-gradient-to-r px-2 py-0.5 text-xs font-medium tracking-wide ${getSubscriptionStyle(
                    doctor.subscription.tier
                  )}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                        doctor.subscription.tier === "premium"
                          ? "bg-amber-500"
                          : doctor.subscription.tier === "pro"
                          ? "bg-slate-300"
                          : "bg-gray-400"
                      }`}
                    />
                    {getSubscriptionLabel(doctor.subscription.tier)}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-all duration-200"
          >
            <Globe className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-sm font-medium dark:text-gray-100">
              {language === "fr" ? "FR" : "EN"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-all duration-200 hover:scale-110 hover:rotate-[8deg]"
          >
            {isDark ? (
              <Sun className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Moon className="h-5 w-5" strokeWidth={1.5} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="w-10 h-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 hover:scale-110 hover:rotate-[8deg]"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </header>
  );
}