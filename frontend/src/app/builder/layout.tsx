import { TopNav } from "@/components/top-nav";
import { ProjectOnly } from "@/guards/project-only";
import { ReactFlowProvider } from "@xyflow/react";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectOnly>
      <TopNav />
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </ProjectOnly>
  );
};

export default Layout;
