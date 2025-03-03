import { FC, PropsWithChildren } from "react";

export const PageContainer: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28">
      {children}
    </div>
  );
};
