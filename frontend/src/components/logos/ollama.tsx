import Image from "next/image";
import { FC } from "react";

export const Ollama: FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  return (
    <Image
      src="/images/logos/ollama.png"
      alt="Ollama"
      width={width}
      height={height}
      className="w-6 h-6"
    />
  );
};
