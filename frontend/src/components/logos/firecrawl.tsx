import Image from "next/image";
import { FC } from "react";

export const Firecrawl: FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  return (
    <Image
      src="/images/logos/firecrawl.png"
      alt="Firecrawl"
      width={width}
      height={height}
      className="w-6 h-6"
    />
  );
};
