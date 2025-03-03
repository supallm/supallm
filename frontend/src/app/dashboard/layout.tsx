import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProjectOnly } from "@/guards/project-only";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectOnly>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </ProjectOnly>
  );
};

export default Layout;
