import { NodeDefinition } from "../types";
import { BaseAgent } from "./base-agent";
import { ReActAgent } from "./react-agent";
import { ToolAgent } from "./tool-agent";

export type AgentType = "tool" | "react";

export class AgentFactory {
  static create(definition?: NodeDefinition): BaseAgent {
    // Si pas de définition ou pas de type spécifié, utiliser l'agent tool par défaut
    const agentType = definition?.config?.agentType || "react";

    switch (agentType) {
      case "react":
        return new ReActAgent();
      case "tool":
      default:
        return new ToolAgent();
    }
  }
}

// Export all agent types
export { BaseAgent } from "./base-agent";
export { ReActAgent } from "./react-agent";
export { ToolAgent } from "./tool-agent";
