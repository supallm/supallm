import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectOnly } from "@/guards/project-only";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectOnly>
      <TopNav />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col w-full mt-[40px] relative pb-15">
          <SidebarTrigger className="absolute top-0 left-0" />
          {children}
        </main>
      </SidebarProvider>
    </ProjectOnly>
  );
};

export default Layout;
