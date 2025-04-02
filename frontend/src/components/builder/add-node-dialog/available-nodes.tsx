import { E2B } from "@/components/logos/e2b";
import { Bot, Code, Database, Network, UserCheck } from "lucide-react";
import { ReactNode } from "react";
import { ProviderLogo } from "../../logos/provider-logo";
import { NodeType } from "../node-types";

export type NodeCategory =
  | "chat"
  | "code"
  | "ai-agent"
  | "agent-model"
  | "agent-memory"
  | "agent-tools";

export const NodeCategoryLabels: Record<NodeCategory, string> = {
  "ai-agent": "AI Agent",
  "agent-model": "AI Agent Model",
  "agent-memory": "AI Agent Memory",
  "agent-tools": "AI Agent Tools",
  chat: "Chat",
  code: "Code",
} as const;

export type AvailableNode = {
  category: NodeCategory;
  type: NodeType;
  name: string;
  description: string;
  logo: ReactNode;
  commingSoon: boolean;
};

export const availableNodes: AvailableNode[] = [
  {
    category: "chat",
    type: "chat-openai",
    name: "OpenAI Chat Completion",
    description:
      "Use this node to send a message to an OpenAI Chat Completion model",
    logo: <ProviderLogo name="openai" width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "chat",
    type: "chat-anthropic",
    name: "Anthropic Chat Completion",
    description:
      "Use this node to send a message to an Anthropic Chat Completion model",
    logo: <ProviderLogo name="anthropic" width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "chat",
    type: "chat-mistral",
    name: "Mistral Chat Completion",
    description:
      "Use this node to send a message to a Mistral Chat Completion model",
    logo: <ProviderLogo name="mistral" width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "chat",
    type: "chat-ollama",
    name: "Ollama Chat Completion",
    description:
      "Use this node to send a message to an Ollama Chat Completion model",
    logo: <ProviderLogo name="ollama" width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "ai-agent",
    type: "ai-agent",
    name: "AI Agent",
    description:
      "Use this node to create an autonomous AI agent that can perform tasks",
    logo: <Bot width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "agent-model",
    type: "model-openai",
    name: "OpenAI Model",
    description: "Connect OpenAI models to your flow",
    logo: <ProviderLogo name="openai" width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "code",
    type: "code-executor",
    name: "Code executor",
    description: "Run custom TypeScript in our secure sandbox",
    logo: <Code width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "agent-tools",
    type: "chat-openai-as-tool",
    name: "OpenAI LLM as tool",
    description: "Use an OpenAI LLM model as an agent tool",
    logo: <ProviderLogo name="openai" width={30} height={30} />,
    commingSoon: false,
  },
  {
    category: "agent-tools",
    type: "http-tool",
    name: "HTTP Client",
    description: "Allow the AI agent make HTTP requests",
    logo: <Network width={20} height={20} />,
    commingSoon: false,
  },
  {
    category: "agent-tools",
    type: "user-feedback",
    name: "User feedback",
    description: "Ask for user feedback during the flow",
    logo: <UserCheck width={20} height={20} />,
    commingSoon: false,
  },
  {
    category: "agent-memory",
    type: "local-memory",
    name: "Local memory",
    description: "Store data in the local memory",
    logo: <Database width={20} height={20} />,
    commingSoon: false,
  },
  {
    category: "agent-tools",
    type: "e2b-interpreter",
    name: "Code interpreter by E2B",
    description: "Use this node to run custom code",
    logo: <E2B width={10} height={10} />,
    commingSoon: false,
  },
  {
    category: "agent-tools",
    type: "http-request",
    name: "HTTP Request",
    description: "Trigger an HTTP endpoint in your AI flow",
    logo: <Network width={20} height={20} />,
    commingSoon: true,
  },
  {
    category: "chat",
    type: "chat-google",
    name: "Google Chat Completion",
    description:
      "Use this node to send a message to a Google Chat Completion model",
    logo: <ProviderLogo name="google" width={30} height={30} />,
    commingSoon: true,
  },
  {
    category: "chat",
    type: "chat-azure",
    name: "Azure Chat Completion",
    description:
      "Use this node to send a message to an Azure Chat Completion model",
    logo: <ProviderLogo name="azure" width={30} height={30} />,
    commingSoon: true,
  },
];
