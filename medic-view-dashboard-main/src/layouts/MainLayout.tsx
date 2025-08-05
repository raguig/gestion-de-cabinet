import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import { AppHeader } from "../components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 bg-background p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
