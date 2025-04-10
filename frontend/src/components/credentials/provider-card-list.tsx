import { ProviderType } from "@/core/entities/credential";
import Link from "next/link";
import { FC } from "react";
import { Brave } from "../logos/brave";
import { Firecrawl } from "../logos/firecrawl";
import { ProviderLogo } from "../logos/provider-logo";
import { Slack } from "../logos/slack";
import { FormDescription } from "../ui/form";
import {
  CredentialChoiceCard,
  CredentialChoiceCardProps,
} from "./credential-choice-card";

export const ProviderInfoMap: Record<
  Exclude<ProviderType, "ollama">,
  Omit<CredentialChoiceCardProps, "onSelected">
> = {
  openai: {
    name: "OpenAI",
    description: "OpenAI is a powerful AI provider",
    logo: <ProviderLogo name="openai" width={30} height={30} />,
    commingSoon: false,
  },
  anthropic: {
    name: "Anthropic",
    description: "Anthropic is a powerful AI provider",
    logo: <ProviderLogo name="anthropic" width={30} height={30} />,
    commingSoon: false,
  },
  mistral: {
    name: "Mistral",
    description: "Mistral is a powerful AI provider",
    logo: <ProviderLogo name="mistral" width={30} height={30} />,
    commingSoon: false,
  },
  google: {
    name: "Google",
    description: "Google is a powerful AI provider",
    logo: <ProviderLogo name="google" width={30} height={30} />,
    commingSoon: true,
  },
  azure: {
    name: "Azure",
    description: "Azure is a powerful AI provider",
    logo: <ProviderLogo name="azure" width={30} height={30} />,
    commingSoon: true,
  },
  e2b: {
    name: "E2B",
    description: "E2B is a powerful code execution provider",
    logo: <ProviderLogo name="e2b" width={30} height={30} />,
    commingSoon: false,
  },
  notion: {
    name: "Notion",
    description: "Connect to your Notion workspace",
    logo: <ProviderLogo name="notion" width={30} height={30} />,
    commingSoon: false,
  },
  postgres: {
    name: "Postgres",
    description: "Connect to your PostgreSQL databases securely",
    logo: <ProviderLogo name="postgres" width={30} height={30} />,
    commingSoon: false,
    apiKeyLabel: "Database URL",
    apiKeyHint: (
      <FormDescription>
        Your database URL is encrypted and stored safely.
      </FormDescription>
    ),
    apiKeyPlaceholder:
      "postgres://username:password@hostname:port/database_name",
  },
  confluence: {
    name: "Confluence",
    description: "Access and search your Confluence workspace documentation",
    logo: <ProviderLogo name="confluence" width={30} height={30} />,
    commingSoon: false,
    apiKeyLabel: "Confluence API Token",
    apiKeyHint: (
      <FormDescription>
        Enter your Confluence API token. You can find more information{" "}
        <Link
          className="text-blue-500"
          target="_blank"
          href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
        >
          in their documentation.
        </Link>
      </FormDescription>
    ),
    apiKeyPlaceholder: "Enter your Confluence API token",
  },
  airtable: {
    name: "Airtable",
    description: "Connect and interact with your Airtable bases",
    logo: <ProviderLogo name="airtable" width={30} height={30} />,
    commingSoon: false,
    apiKeyLabel: "Personal Access Token",
    apiKeyHint: (
      <FormDescription>
        You can find your Personal Access Token in your{" "}
        <Link
          className="text-blue-500"
          target="_blank"
          href="https://support.airtable.com/docs/creating-personal-access-tokens"
        >
          Airtable account settings
        </Link>
        . The token will be encrypted and stored securely.
      </FormDescription>
    ),
    apiKeyPlaceholder: "Your personal access token",
  },
  slack: {
    name: "Slack",
    description: "Connect to Slack workspaces and send messages",
    logo: <Slack width={30} height={30} />,
    commingSoon: false,
    apiKeyLabel: "Slack Token",
    apiKeyHint: (
      <FormDescription>
        Enter your Slack User Token. You can find more information{" "}
        <Link
          className="text-blue-500"
          target="_blank"
          href="https://api.slack.com/docs/token-types"
        >
          in their documentation.
        </Link>
      </FormDescription>
    ),
    apiKeyPlaceholder: "Your slack token",
  },
  firecrawl: {
    name: "Firecrawl",
    description: "Web crawling and scraping provider",
    logo: <Firecrawl width={30} height={30} />,
    commingSoon: false,
  },
  brave: {
    name: "Brave Search",
    description:
      "Independent search engine API with high-quality data, perfect for building search and AI applications",
    logo: <Brave width={30} height={30} />,
    commingSoon: false,
    apiKeyLabel: "Brave Search API Key",
    apiKeyHint: (
      <FormDescription>
        Visit{" "}
        <Link
          className="text-blue-500"
          target="_blank"
          href={
            "https://api-dashboard.search.brave.com/app/documentation/web-search/get-started"
          }
        >
          Brave Documentation
        </Link>{" "}
        to learn more.
      </FormDescription>
    ),
    apiKeyPlaceholder: "Enter your Brave Search API key",
  },
} as const;

export const ProviderCardList: FC<{
  onSelected: (provider: ProviderType) => void;
}> = ({ onSelected }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(ProviderInfoMap).map(
        ([key, value]) =>
          !value.commingSoon && (
            <CredentialChoiceCard
              key={key}
              name={value.name}
              description={value.description}
              commingSoon={value.commingSoon}
              logo={value.logo}
              onSelected={() => onSelected(key as ProviderType)}
            />
          ),
      )}
    </div>
  );
};
