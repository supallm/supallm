import { assertUnreachable } from "../../utils/type-safety";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeLogCallback,
  NodeResultCallback,
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
    options: {
      onNodeResult: NodeResultCallback;
      onNodeLog: NodeLogCallback;
    },
  ): Promise<any> {
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
            // TODO @val: do what you need to do with the Error
            console.error(`Error executing code node ${nodeId}: ${error}`);
            throw error;
          }

          Object.entries(parsedResult).forEach(([key, value]) => {
            options.onNodeResult(nodeId, key, value, "any");
          });
          return parsedResult;
        default:
          assertUnreachable(language);
      }
    } catch (error) {
      console.error("Unexpected error while executing code node", error);
      throw error;
    }
  }
}
