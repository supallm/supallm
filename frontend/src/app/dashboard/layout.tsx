import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProjectOnly } from "@/guards/project-only";
import { TopNav } from "@/components/top-nav";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectOnly>
      <TopNav />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col w-full mt-[40px] relative">
          <SidebarTrigger className="absolute top-0 left-0" />
          {children}
        </main>
      </SidebarProvider>
    </ProjectOnly>
  );
};

export default Layout;
