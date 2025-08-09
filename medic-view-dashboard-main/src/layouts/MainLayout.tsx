import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import { AppHeader } from "../components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row min-h-screen w-full bg-background">
        {/* Sidebar - hidden on mobile, visible on md and up */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen w-full">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="container mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
