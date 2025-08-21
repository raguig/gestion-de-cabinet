import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import { AppHeader } from "../components/AppHeader";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

function MainLayoutContent() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <AppSidebar />

      {/* Main Content Container */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? "ml-20" : "ml-72"}`}
      >
        <AppHeader />

        {/* Main Content Area */}
        <main className="flex-1 w-full h-full pt-16">
          <div className="h-full w-full p-4 md:p-6 lg:p-8">
            <div className="h-full w-full max-w-[2000px] mx-auto">
              <div className="min-h-[calc(100vh-10rem)]">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MainLayout() {
  return (
    <SidebarProvider>
      <MainLayoutContent />
    </SidebarProvider>
  );
}
