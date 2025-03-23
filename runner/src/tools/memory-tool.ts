import { Result } from "typescript-result";
import { NodeType } from "../nodes/types";
import { LLMMemoryService } from "../services/llm-memory/llm-memory.interface";
import { RedisMemoryService } from "../services/llm-memory/redis-llm-memory-service";
import config from "../utils/config";
import {
  MemoryToolAction,
  MemoryToolParams,
  Tool,
  ToolType,
} from "./tool.interface";
export class MemoryTool<T> implements Tool<T> {
  id: string;
  type: ToolType = "memory";
  private memoryService: LLMMemoryService;

  constructor(id: string) {
    this.id = id;
    this.memoryService = new RedisMemoryService(config.redisUrl);
  }

  canHandle(nodeType: NodeType): boolean {
    return nodeType === "llm";
  }

  async run(
    action: MemoryToolAction,
    params: MemoryToolParams,
  ): Promise<Result<T, Error>> {
    const { sessionId, nodeId, messages } = params;

    switch (action) {
      case "load":
        const [result, error] = (
          await this.memoryService.getMessages(sessionId, nodeId)
        ).toTuple();
        if (error) {
          return Result.error(error);
        }

        return Result.ok(result as T);

      case "append":
        if (messages?.length) {
          const [_, error] = (
            await this.memoryService.addMessages(sessionId, nodeId, messages)
          ).toTuple();
          if (error) {
            return Result.error(error);
          }
        }

        return Result.ok(null as T);

      default:
        return Result.error(
          new Error(`unsupported action "${action}" for tool "${this.id}"`),
        );
    }
  }
}
