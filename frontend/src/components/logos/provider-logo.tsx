import { FC } from "react";
import { OpenAI } from "./openai";
import { LLMProviderName } from "@/core/entities/llm-provider";
import { Azure } from "./azure";
import { Anthropic } from "./anthropic";
import { Google } from "./google";
import { Mistral } from "./mistral";

export const ProviderLogo: FC<{
  name: LLMProviderName;
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
