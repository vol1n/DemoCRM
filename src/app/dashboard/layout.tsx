import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "../_components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mr-8 ml-8 mt-8 mb-8 w-full">
      <Toaster />
      <SidebarProvider className="w-full">
        <AppSidebar />

        <SidebarTrigger />
        {children}

      </SidebarProvider>

    </div>
  );
}
