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
  e2b: {
    name: "E2B",
    description: "E2B is a powerful AI provider",
    logo: <ProviderLogo name="e2b" width={30} height={30} />,
    commingSoon: false,
  },
  notion: {
    name: "Notion",
    description: "Notion is a powerful knowledge base provider",
    logo: <ProviderLogo name="notion" width={30} height={30} />,
    commingSoon: false,
    apiKeyLabel: "Notion Integration Token",
    apiKeyHint: (
      <FormDescription>
        Check out the{" "}
        <Link
          href="https://developers.notion.com/docs/create-a-notion-integration#step-1-create-an-integration"
          className="text-blue-500"
        >
          Notion documentation{" "}
        </Link>
        to know how to get this token{" "}
      </FormDescription>
    ),
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
};

export const ProviderCardList: FC<{
  onSelected: (provider: ProviderType) => void;
}> = ({ onSelected }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(ProviderInfoMap).map(([key, value]) => (
        <CredentialChoiceCard
          key={key}
          name={value.name}
          description={value.description}
          commingSoon={value.commingSoon}
          logo={value.logo}
          onSelected={() => onSelected(key as ProviderType)}
        />
      ))}
    </div>
  );
};
