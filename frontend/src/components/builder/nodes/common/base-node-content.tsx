import { FC, PropsWithChildren } from "react";

export const BaseNodeContent: FC<PropsWithChildren> = ({ children }) => {
  return <div className="">{children}</div>;
};
