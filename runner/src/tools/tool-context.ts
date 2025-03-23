import { Result } from "typescript-result";
import { NodeType } from "../nodes/types";
import { Params, Tool, ToolAction, ToolType } from "./tool.interface";
export class ToolContext {
  constructor(
    private nodeType: NodeType,
    private tools: Partial<Record<ToolType, Tool>>,
  ) {}

  async run<T>(
    toolType: ToolType,
    action: ToolAction,
    params: Params,
  ): Promise<Result<T, Error>> {
    const tool = Object.values(this.tools).find(
      (t) => t.type === toolType && t.canHandle(this.nodeType),
    );

    if (!tool) return Result.error(new Error("tool not found"));

    const result = await tool.run(action, params);

    if (result.isError()) {
      return Result.error(result.error);
    }

    return Result.ok(result.value as T);
  }
}
