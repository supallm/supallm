import { TopNav } from "@/components/top-nav";
import { ProjectOnly } from "@/guards/project-only";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectOnly>
      <TopNav />
      {children}
    </ProjectOnly>
  );
};

export default Layout;
