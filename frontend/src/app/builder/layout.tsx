import { BuilderTopNav } from "@/components/builder-top-nav";
import { ProjectOnly } from "@/guards/project-only";
import { ReactFlowProvider } from "@xyflow/react";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectOnly>
      <BuilderTopNav />
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </ProjectOnly>
  );
};

export default Layout;
