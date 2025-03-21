import { assertUnreachable } from "../../utils/type-safety";
import {
  INode,
  NodeDefinition,
  NodeInput,
  NodeLogCallback,
  NodeResultCallback,
  NodeType,
} from "../types";
import { Argument, NodejsExecutor } from "./nodejs-executor/nodejs-executor";

interface CodeExecutorNodeDefinition {
  code: string;
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
      const { code } = definition as unknown as CodeExecutorNodeDefinition;
      const resolvedInputs = inputs as Record<string, string>;

      const args = Object.entries(resolvedInputs).map(([key, value]) => {
        return {
          name: key,
          // TODO @val: how do we know the type of the value?
          type: "any",
          value,
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
            console.log("ON NODE RESULT", key, value);
            options.onNodeResult(nodeId, key, value, "any");
          });
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

// const codeExecutorNode = new CodeExecutorNode();

// codeExecutorNode.execute(
//   "1",
//   {
//     type: "code-executor",
//     inputs: {},
//     outputs: {},
//   },
//   {
//     code: `import { z } from "zod";

//     function main(myValue: any, myValue2: any, double: (num: number) => number, myArray: any[], myObjArray: any[], myNumber: number, myBoolean: boolean) {
//         let i = 0;
//         while (i < 5) {
//             console.log("Hello, world!", i);
//             i++;
//         }

//         console.log('ZOD', z);

//         return {
//             "coucou": true,
//             "i": i,
//             "z": {
//                 "coucou": true,
//                 "i": i,
//             },
//             "myValue": myValue,
//             "doubled": double(10),
//             "array": myArray,
//             "objArray": myObjArray,
//             "myNumber": myNumber,
//             "myBoolean": myBoolean,
//         }
//       }`,
//     language: "typescript",
//     args: [
//       {
//         name: "myValue",
//         type: "string",
//         value: "test",
//       },
//       {
//         name: "myValue2",
//         type: "any",
//         value: {
//           coucou: true,
//         },
//       },
//       {
//         name: "double",
//         type: "any",
//         value: (num: number) => num * 2,
//       },
//       {
//         name: "myArray",
//         type: "any",
//         value: [1, 2, 3],
//       },
//       {
//         name: "myObjArray",
//         type: "any",
//         value: [{ i: 1 }, { i: 2 }],
//       },
//       {
//         name: "myNumber",
//         type: "number",
//         value: 10,
//       },
//       {
//         name: "myBoolean",
//         type: "boolean",
//         value: true,
//       },
//     ],
//   },
//   {
//     onNodeLog: async (message) => {
//       //   console.log("LOG", message);
//     },
//     onNodeResult: async (result) => {
//       //   console.log("RESULT", result);
//     },
//   },
// );
