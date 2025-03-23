import { Result } from "typescript-result";
import { Tool } from "../../tools";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeType,
} from "../types";
import { MissingArgumentError } from "./nodejs-executor/executor.errors";
import { Argument, NodejsExecutor } from "./nodejs-executor/nodejs-executor";

interface CodeExecutorNodeDefinition {
  code: string;
  language: "typescript";
  inputs: Record<string, string>;
  expectedArguments: { id: string; label: string; type: string }[];
  expectedOutputs: { id: string; label: string; type: string }[];
}

export class CodeExecutorNode implements INode {
  readonly type: NodeType = "code-executor";

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    _tools: Record<string, Tool>,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    try {
      const { code, expectedArguments } =
        definition as unknown as CodeExecutorNodeDefinition;

      const sortedExpectedArgumentLabels = expectedArguments.map(
        (arg) => arg.label,
      );

      const args = sortedExpectedArgumentLabels.map((label) => {
        const matchingInput = inputs[label];

        // TODO @val: you can add your error handling here
        if (!matchingInput) {
          const errorMessage = `Missing argument named ${label}. This is likely a mistake in your flow.`;
          options.onNodeLog(nodeId, errorMessage);
          throw new MissingArgumentError(errorMessage);
        }

        return {
          name: label,
          type: "any",
          value: matchingInput,
        } as Argument;
      });

      const language = "typescript";

      console.log("CALLING EXECUTION NODE WITH:", {
        code,
        args,
      });

      switch (language) {
        case "typescript":
          const executor = new NodejsExecutor();
          const result = await executor.runTypeScript(
            code,
            args,
            (data) => {
              options.onNodeLog(nodeId, data);
            },
            (data) => {
              options.onNodeLog(nodeId, data);
            },
          );

          const [parsedResult, error] = result.toTuple();

          if (error) {
            return Result.error(error);
          }

          Object.entries(parsedResult).forEach(([key, value]) => {
            options.onNodeResult(nodeId, key, value, "any");
          });
          return Result.ok(parsedResult);
        default:
          return Result.error(new Error("Unsupported language"));
      }
    } catch (error) {
      console.error(error);
      return Result.error(error as Error);
    }
  }
}
