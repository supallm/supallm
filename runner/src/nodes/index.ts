import { EntrypointNode } from "./base/entrypoint-node";
import { ResultNode } from "./base/result-node";
import { LLMNode } from "./llm/llm-node";
import { INode } from "../interfaces/node";

// Base nodes
export const baseNodes = {
  entrypoint: EntrypointNode,
  result: ResultNode,
};

// LLM nodes
export const llmNodes = {
  llm: LLMNode,
};

// All nodes
export const allNodes = {
  ...baseNodes,
  ...llmNodes,
};

// Function to get a node by type
export function getNodeByType(type: string) {
  return allNodes[type as keyof typeof allNodes];
}

// Function to create a node instance by type
export function createNodeInstance(type: string): INode {
  const NodeClass = getNodeByType(type);
  if (!NodeClass) {
    throw new Error(`Node type '${type}' not found`);
  }
  return new NodeClass();
} 