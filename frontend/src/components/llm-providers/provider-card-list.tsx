import { ProviderLogo } from "../logos/provider-logo";
import { LLMProviderCard, LLMProviderCardProps } from "./llm-provider-card";
import { FC } from "react";
import { LLMProviderName } from "@/core/entities/llm-provider";

export const ProviderCardList: FC<{
  onSelected: (provider: LLMProviderName) => void;
}> = ({ onSelected }) => {
  const ProviderInfoMap: Record<
    LLMProviderName,
    Omit<LLMProviderCardProps, "onSelected">
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
      commingSoon: true,
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
    mistral: {
      name: "Mistral",
      description: "Mistral is a powerful AI provider",
      logo: <ProviderLogo name="mistral" width={30} height={30} />,
      commingSoon: true,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(ProviderInfoMap).map(([key, value]) => (
        <LLMProviderCard
          key={key}
          name={value.name}
          description={value.description}
          commingSoon={value.commingSoon}
          logo={value.logo}
          onSelected={() => onSelected(key as LLMProviderName)}
        />
      ))}
    </div>
  );
};
