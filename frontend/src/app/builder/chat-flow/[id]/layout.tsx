import { FlowOnly } from "@/guards/flow-only";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <FlowOnly>{children}</FlowOnly>;
};

export default Layout;
