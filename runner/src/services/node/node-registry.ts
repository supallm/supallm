import { INode } from "../../interfaces/node";
import { allNodes } from "../../nodes";
import { logger } from "../../utils/logger";

export class NodeRegistry {
  private static instance: NodeRegistry;
  private nodeTypes: Map<string, new () => INode>;

  private constructor() {
    this.nodeTypes = new Map();
    this.registerDefaultNodes();
  }

  public static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  private registerDefaultNodes() {
    for (const [type, NodeClass] of Object.entries(allNodes)) {
      this.registerNode(type, NodeClass as unknown as new () => INode);
    }
  }

  public registerNode(type: string, nodeClass: new () => INode) {
    if (this.nodeTypes.has(type)) {
      logger.warn(`Node type '${type}' is already registered. Overwriting.`);
    }
    this.nodeTypes.set(type, nodeClass);
    logger.info(`Registered node type: ${type}`);
  }

  public getNodeInstance(type: string): INode {
    const NodeClass = this.nodeTypes.get(type);
    if (!NodeClass) {
      throw new Error(`Node type '${type}' not found in registry`);
    }
    return new NodeClass();
  }

  public hasNodeType(type: string): boolean {
    return this.nodeTypes.has(type);
  }

  public getAllNodeTypes(): string[] {
    return Array.from(this.nodeTypes.keys());
  }
} 