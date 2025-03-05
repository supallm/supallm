import { ProviderType } from "@/core/entities/credential";
import { FC } from "react";
import { Anthropic } from "./anthropic";
import { Azure } from "./azure";
import { Google } from "./google";
import { Mistral } from "./mistral";
import { OpenAI } from "./openai";

export const ProviderLogo: FC<{
  name: ProviderType;
  width?: number;
  height?: number;
}> = ({ name, width, height }) => {
  const w = width || 16;
  const h = height || 16;

  switch (name) {
    case "openai":
      return <OpenAI width={w} height={h} />;
    case "azure":
      return <Azure width={w} height={h} />;
    case "anthropic":
      return <Anthropic width={w} height={h} />;
    case "google":
      return <Google width={w} height={h} />;
    case "mistral":
      return <Mistral width={w} height={h} />;
    default:
      return <div>No logo available</div>;
  }
};
