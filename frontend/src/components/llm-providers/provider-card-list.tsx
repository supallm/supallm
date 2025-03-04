import { ProviderLogo } from "../logos/provider-logo";
import { ProviderName } from "@/core/entities/provider";
import { LLMProviderCard, LLMProviderCardProps } from "./llm-provider-card";

export const ProviderCardList = () => {
  const ProviderInfoMap: Record<ProviderName, LLMProviderCardProps> = {
    openai: {
      name: "OpenAI",
      description: "OpenAI is a powerful AI provider",
      logo: <ProviderLogo name="openai" width={30} height={30} />,
    },
    anthropic: {
      name: "Anthropic",
      description: "Anthropic is a powerful AI provider",
      logo: <ProviderLogo name="anthropic" width={50} height={50} />,
    },
    google: {
      name: "Google",
      description: "Google is a powerful AI provider",
      logo: <ProviderLogo name="google" width={50} height={50} />,
    },
    azure: {
      name: "Azure",
      description: "Azure is a powerful AI provider",
      logo: <ProviderLogo name="azure" width={50} height={50} />,
    },
    claude: {
      name: "Claude",
      description: "Claude is a powerful AI provider",
      logo: <ProviderLogo name="claude" width={50} height={50} />,
    },
    groq: {
      name: "Groq",
      description: "Groq is a powerful AI provider",
      logo: <ProviderLogo name="groq" width={50} height={50} />,
    },
    gemini: {
      name: "Gemini",
      description: "Gemini is a powerful AI provider",
      logo: <ProviderLogo name="gemini" width={50} height={50} />,
    },
    perplexity: {
      name: "Perplexity",
      description: "Perplexity is a powerful AI provider",
      logo: <ProviderLogo name="perplexity" width={50} height={50} />,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(ProviderInfoMap).map(([key, value]) => (
        <LLMProviderCard
          key={key}
          name={value.name}
          description={value.description}
          logo={value.logo}
        />
      ))}
    </div>
  );
};
