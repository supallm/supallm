import { E2B } from "@/components/logos/e2b";
import { Network } from "lucide-react";
import { ReactNode } from "react";
import { ProviderLogo } from "../../logos/provider-logo";
import { NodeType } from "../node-types";

export type AvailableNode = {
  type: NodeType;
  name: string;
  description: string;
  logo: ReactNode;
  commingSoon: boolean;
};

export const availableNodes: AvailableNode[] = [
  {
    type: "chat-openai",
    name: "OpenAI Chat Completion",
    description:
      "Use this node to send a message to an OpenAI Chat Completion model",
    logo: <ProviderLogo name="openai" width={30} height={30} />,
    commingSoon: false,
  },
  {
    type: "e2b-interpreter",
    name: "Code interpreter by E2B",
    description: "Use this node to run custom code",
    logo: <E2B width={10} height={10} />,
    commingSoon: false,
  },
  {
    type: "http-request",
    name: "HTTP Request",
    description: "Trigger an HTTP endpoint in your AI flow",
    logo: <Network width={20} height={20} />,
    commingSoon: false,
  },
  {
    type: "chat-anthropic",
    name: "Anthropic Chat Completion",
    description:
      "Use this node to send a message to an Anthropic Chat Completion model",
    logo: <ProviderLogo name="anthropic" width={30} height={30} />,
    commingSoon: true,
  },
  {
    type: "chat-google",
    name: "Google Chat Completion",
    description:
      "Use this node to send a message to a Google Chat Completion model",
    logo: <ProviderLogo name="google" width={30} height={30} />,
    commingSoon: true,
  },
  {
    type: "chat-azure",
    name: "Azure Chat Completion",
    description:
      "Use this node to send a message to an Azure Chat Completion model",
    logo: <ProviderLogo name="azure" width={30} height={30} />,
    commingSoon: true,
  },
];
