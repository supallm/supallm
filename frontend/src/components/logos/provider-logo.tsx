import { FC } from "react";
import { OpenAI } from "./openai";
import { ProviderName } from "@/core/entities/provider";

export const ProviderLogo: FC<{
  name: ProviderName;
  width?: number;
  height?: number;
}> = ({ name, width, height }) => {
  const w = width || 16;
  const h = height || 16;

  switch (name) {
    case "openai":
      return <OpenAI width={w} height={h} />;
    default:
      return <div>No logo available</div>;
  }
};
