import { assertUnreachable } from "../../utils/type-safety";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeLogCallback,
  NodeResultCallback,
  NodeType,
} from "../types";
import { NodejsExecutor } from "./nodejs-executor/nodejs-executor";

type Arguments = Record<string, any>;

interface CodeExecutorNodeInputs {
  code: string;
  language: "typescript";
  args: Arguments;
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
      const resolvedInputs = inputs as CodeExecutorNodeInputs;
      const { code, language = "typescript", args = {} } = resolvedInputs;

      switch (language) {
        case "typescript":
          const executor = new NodejsExecutor();
          const result = await executor.runTypeScript(
            code,
            args,
            (data) => {
              console.log("STDOUT", data);
            },
            (data) => {
              console.log("STDERR", data);
            },
          );
          const [parsedResult, error] = result.toTuple();

          if (error) {
            // TODO @val: do what you need to do with the Error
            console.error(error);
            throw error;
          }

          console.log("FINAL RESULT=>", parsedResult);
          return parsedResult;
        default:
          assertUnreachable(language);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

const codeExecutorNode = new CodeExecutorNode();

codeExecutorNode.execute(
  "1",
  {
    type: "code-executor",
    inputs: {},
    outputs: {},
  },
  {
    code: `import { z } from "zod";

    function main() {
        let i = 0;
        while (i < 5) {
            console.log("Hello, world!", i);
            i++;
        }

        console.log('ZOD', z);
    
        return {
            "coucou": true,
            "i": i,
            "z": {
                "coucou": true,
                "i": i,
            }
        }
      }`,
    language: "typescript",
    args: {},
  },
  {
    onNodeLog: async (message) => {
      console.log("LOG", message);
    },
    onNodeResult: async (result) => {
      console.log("RESULT", result);
    },
  },
);
