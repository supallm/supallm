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
  private memories: Map<string, IMemory>;

  private constructor() {
    this.memories = new Map();
    this.registerDefaultMemories();
  }

  static getInstance(): MemoryRegistry {
    if (!MemoryRegistry.instance) {
      MemoryRegistry.instance = new MemoryRegistry();
    }
    return MemoryRegistry.instance;
  }

  private registerDefaultMemories(): void {
    this.register("local-memory", new LocalMemory());
    this.register("none", new NoMemory());
  }

  register(type: string, memory: IMemory): void {
    this.memories.set(type, memory);
  }

  create(config: MemoryConfig): Result<IMemory, Error> {
    const memory = this.memories.get(config.type);
    if (!memory) {
      return Result.error(new Error(`Memory type ${config.type} not found`));
    }
    return Result.ok(memory);
  }
}
