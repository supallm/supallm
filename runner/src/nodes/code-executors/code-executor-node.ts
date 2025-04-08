import { Result } from "typescript-result";
import { logger } from "../../utils/logger";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeOptions,
  NodeOutput,
  NodeOutputDef,
  NodeType,
} from "../types";
import { MissingArgumentError } from "./nodejs-executor/executor.errors";
import { Argument, NodejsExecutor } from "./nodejs-executor/nodejs-executor";

interface CodeExecutorNodeDefinition {
  type: string;
  config: {
    code: string;
    language?: "typescript";
    inputs?: Record<string, string>;
    expectedArguments: { id: string; label: string; type: string }[];
    expectedOutputs: { id: string; label: string; type: string }[];
  };
}

export class CodeExecutorNode implements INode {
  readonly type: NodeType = "code-executor";

  async execute(
    nodeId: string,
    definition: NodeDefinition,
    inputs: NodeInput,
    options: NodeOptions,
  ): Promise<Result<NodeOutput, Error>> {
    try {
      const { config } = definition as unknown as CodeExecutorNodeDefinition;
      const { code, expectedArguments } = config;

      logger.debug(`expectedArguments: ${JSON.stringify(expectedArguments)}`);

      const sortedExpectedArgumentLabels = expectedArguments.map(
        (arg) => arg.label,
      );

      const args = sortedExpectedArgumentLabels.map((label) => {
        const matchingInput = inputs[label];

        // TODO @val: you can add your error handling here
        if (!matchingInput) {
          const errorMessage = `Missing argument named ${label}. This is likely a mistake in your flow.`;
          options.onEvent("NODE_LOG", {
            nodeId,
            message: errorMessage,
          });
          throw new MissingArgumentError(errorMessage);
        }

        return {
          name: label,
          type: "any",
          value: matchingInput,
        } as Argument;
      });

      const language = "typescript";

      switch (language) {
        case "typescript":
          const executor = new NodejsExecutor();
          const result = await executor.runTypeScript(
            code,
            args,
            (data) => {
              options.onEvent("NODE_LOG", {
                nodeId,
                message: data,
              });
            },
            (data) => {
              options.onEvent("NODE_LOG", {
                nodeId,
                message: data,
              });
            },
          );

          const [parsedResult, error] = result.toTuple();

          if (error) {
            return Result.error(error);
          }

          Object.entries(parsedResult).forEach(([key, value]) => {
            const outputKey = this.getOutputKey(key, definition.outputs);
            if (outputKey) {
              options.onEvent("NODE_RESULT", {
                nodeId,
                outputField: outputKey,
                data: value,
                ioType: "any",
              });
            }
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

  private getOutputKey(
    output: string,
    outputs: Record<string, NodeOutputDef>,
  ): string {
    const outputDef = outputs[output];
    if (outputDef && outputDef.result_key) {
      return outputDef.result_key;
    }
    return "";
  }
}
