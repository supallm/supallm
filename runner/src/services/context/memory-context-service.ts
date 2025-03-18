import { IContextService, ExecutionContext } from "./context.interface";
import { logger } from "../../utils/logger";

export class MemoryContextService implements IContextService {
  private contexts: Map<string, ExecutionContext> = new Map();

  async initialize(workflowId: string, context: ExecutionContext): Promise<void> {
    if (this.contexts.has(workflowId)) {
      logger.warn(`context for workflow ${workflowId} already exists. overwriting.`);
    }
    
    this.contexts.set(workflowId, structuredClone(context));
    logger.debug(`initialized context for workflow ${workflowId}`);
  }

  async getContext(workflowId: string): Promise<ExecutionContext | null> {
    const context = this.contexts.get(workflowId);
    
    if (!context) {
      logger.warn(`context for workflow ${workflowId} not found`);
      return null;
    }
    
    return structuredClone(context);
  }

  async updateContext(workflowId: string, update: Partial<ExecutionContext>): Promise<void> {
    const context = this.contexts.get(workflowId);
    
    if (!context) {
      logger.error(`cannot update context for workflow ${workflowId}: context not found`);
      throw new Error(`context for workflow ${workflowId} not found`);
    }
    
    Object.assign(context, update);
    logger.debug(`updated context for workflow ${workflowId}`);
  }

  async markNodeCompleted(workflowId: string, nodeId: string): Promise<void> {
    const context = this.contexts.get(workflowId);
    
    if (!context) {
      logger.error(`cannot mark node ${nodeId} as completed: context for workflow ${workflowId} not found`);
      throw new Error(`context for workflow ${workflowId} not found`);
    }
    
    context.completedNodes.add(nodeId);
    logger.debug(`marked node ${nodeId} as completed in workflow ${workflowId}`);
  }

  async deleteContext(workflowId: string): Promise<void> {
    if (!this.contexts.has(workflowId)) {
      logger.warn(`cannot delete context for workflow ${workflowId}: context not found`);
      return;
    }
    
    this.contexts.delete(workflowId);
    logger.debug(`deleted context for workflow ${workflowId}`);
  }
} 