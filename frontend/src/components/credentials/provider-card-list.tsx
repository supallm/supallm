import { ProviderType } from "@/core/entities/credential";
import Link from "next/link";
import { FC } from "react";
import { ProviderLogo } from "../logos/provider-logo";
import { FormDescription } from "../ui/form";
import {
  CredentialChoiceCard,
  CredentialChoiceCardProps,
} from "./credential-choice-card";

export const ProviderInfoMap: Record<
  ProviderType,
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
  ollama: {
    name: "Ollama",
    description: "Ollama is a powerful AI provider",
    logo: <ProviderLogo name="ollama" width={30} height={30} />,
    commingSoon: false,
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
