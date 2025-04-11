import Image from "next/image";
import { FC } from "react";

export const Perplexity: FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  return (
    <Image
      src="/images/logos/perplexity.png"
      alt="Perplexity"
      width={width}
      height={height}
      className="w-6 h-6"
    />
  );
};
