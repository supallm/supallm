import { FC } from "react";

export const E2B: FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  return (
    <img
      src="/images/logos/e2b.gif"
      alt="E2B"
      width={width}
      height={height}
      className="w-6 h-6"
    />
  );
};
