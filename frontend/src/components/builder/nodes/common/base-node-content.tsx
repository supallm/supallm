import { FC, PropsWithChildren } from "react";

export const BaseNodeContent: FC<PropsWithChildren> = ({ children }) => {
  return <div className="py-2 px-3">{children}</div>;
};
