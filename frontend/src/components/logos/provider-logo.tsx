import { FC } from "react";
import { Airtable } from "./airtable";
import { Anthropic } from "./anthropic";
import { Azure } from "./azure";
import { Brave } from "./brave";
import { Confluence } from "./confluence";
import { E2B } from "./e2b";
import { Firecrawl } from "./firecrawl";
import { Google } from "./google";
import { Mistral } from "./mistral";
import { Notion } from "./notion";
import { Ollama } from "./ollama";
import { OpenAI } from "./openai";
import { Perplexity } from "./perplexity";
import { PostgresLogo } from "./postgres";
import { Slack } from "./slack";

export type ProviderLogoName =
  | "openai"
  | "anthropic"
  | "mistral"
  | "google"
  | "azure"
  | "ollama"
  | "e2b"
  | "notion"
  | "postgres"
  | "confluence"
  | "airtable"
  | "slack"
  | "firecrawl"
  | "brave"
  | "perplexity";

export const ProviderLogo: FC<{
  name: ProviderLogoName;
  width?: number;
  height?: number;
}> = ({ name, width = 16, height = 16 }) => {
  switch (name) {
    case "openai":
      return <OpenAI width={width} height={height} />;
    case "azure":
      return <Azure width={width} height={height} />;
    case "anthropic":
      return <Anthropic width={width} height={height} />;
    case "google":
      return <Google width={width} height={height} />;
    case "mistral":
      return <Mistral width={width} height={height} />;
    case "e2b":
      return <E2B width={width} height={height} />;
    case "ollama":
      return <Ollama width={width} height={height} />;
    case "notion":
      return <Notion width={width} height={height} />;
    case "postgres":
      return <PostgresLogo width={width} height={height} />;
    case "confluence":
      return <Confluence width={width} height={height} />;
    case "airtable":
      return <Airtable width={width} height={height} />;
    case "slack":
      return <Slack width={width} height={height} />;
    case "firecrawl":
      return <Firecrawl width={width} height={height} />;
    case "brave":
      return <Brave width={width} height={height} />;
    case "perplexity":
      return <Perplexity width={width} height={height} />;
    default:
      return null;
  }
};
