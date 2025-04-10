import { BaseMessage } from "@langchain/core/messages";
import { Result } from "typescript-result";
import { LocalMemory } from "./local-memory";
import { IMemory, MemoryConfig } from "./memory.interface";

class NoMemory implements IMemory {
  async getMessages(): Promise<Result<BaseMessage[], Error>> {
    return Result.ok([]);
  }

  async addMessages(): Promise<Result<void, Error>> {
    return Result.ok();
  }

  async clear(): Promise<Result<void, Error>> {
    return Result.ok();
  }
}

export class MemoryRegistry {
  private static instance: MemoryRegistry;
  private constructor() {}

  static getInstance(): MemoryRegistry {
    if (!MemoryRegistry.instance) {
      MemoryRegistry.instance = new MemoryRegistry();
    }
    return MemoryRegistry.instance;
  }

  create(config: MemoryConfig): Result<IMemory, Error> {
    try {
      switch (config.type) {
        case "local-memory":
          return Result.ok(new LocalMemory());
        case "none":
          return Result.ok(new NoMemory());
        default:
          return Result.error(new Error(`Unknown memory type: ${config.type}`));
      }
    } catch (error) {
      return Result.error(
        new Error(`Failed to create memory: ${(error as Error).message}`),
      );
    }
  }
}
