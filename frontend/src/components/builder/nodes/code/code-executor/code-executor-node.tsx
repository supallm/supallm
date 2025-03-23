import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { generateHandleId, sanitizeHandleLabel } from "@/lib/handles";
import { zodResolver } from "@hookform/resolvers/zod";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { Code } from "lucide-react";
import { FC, memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode, { BaseNodeHandle } from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import {
  CodeEditorDialog,
  CodeEditorOnChangeParams,
} from "./code-editor-dialog";
import { CodePreview } from "./code-preview";

type CustomCodeNodeProps = NodeProps & {
  data: {
    code: string;
    inputs: Array<BaseNodeHandle>;
    outputs: Array<BaseNodeHandle>;
  };
};

const defaultCode = `// You can import modules like this:
// import axios from 'axios';

// Your code *MUST* export a function called "main".
// The arguments of this function will be the inputs of the node.
export async function main(myInput: string) {

    // You *MUST* return an object with the keys you want to expose as outputs.
    return {
        result: myInput.length,
    }
}`;

const CodeExecutorNode: FC<CustomCodeNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();

  const formSchema = z.object({
    code: z.string().min(1, "Code cannot be empty"),
    inputs: z.array(
      z.object({
        type: z.enum(["text", "image", "any"]),
        id: z.string(),
        label: z.string(),
      }),
    ),
    outputs: z.array(
      z.object({
        type: z.enum(["text", "image", "any"]),
        id: z.string(),
        label: z.string(),
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      code: data.code ?? defaultCode,
      inputs: data.inputs ?? [],
      outputs: data.outputs ?? [],
    },
  });

  const inputHandles = form.watch("inputs");
  const outputHandles = form.watch("outputs");

  const handleCodeChange = (values: CodeEditorOnChangeParams) => {
    console.log("values", values);
    const inputHandles = values.inputs.map(
      (input) =>
        ({
          label: sanitizeHandleLabel(input.name),
          id: generateHandleId("any", input.name),
          type: "any",
        }) as const,
    );

    const outputHandles = values.outputs.keys.map(
      (key) =>
        ({
          label: sanitizeHandleLabel(key),
          id: generateHandleId("any", key),
          type: "any",
        }) as const,
    );

    form.setValue("inputs", inputHandles);
    form.setValue("outputs", outputHandles);
    form.setValue("code", values.code);

    updateNodeData(nodeId, {
      code: values.code,
      inputs: inputHandles,
      outputs: outputHandles,
    });
  };

  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={outputHandles}
      inputHandles={inputHandles}
      header={
        <>
          <Code width={10} height={10} />
          <span className="font-medium text-sm">Code executor</span>
        </>
      }
    >
      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form className="space-y-4">
              <div>
                <div className="border rounded p-2 bg-gray-100 max-h-[100px] overflow-hidden">
                  <pre className="text-xs">
                    <CodePreview
                      language="typescript"
                      filename="function.ts"
                      code={form.getValues("code")}
                    ></CodePreview>
                  </pre>
                </div>
              </div>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CodeEditorDialog
                        data={{
                          code: field.value,
                        }}
                        onChange={handleCodeChange}
                      >
                        <Button
                          size={"sm"}
                          variant="outline"
                          startContent={<Code className="w-4 h-4" />}
                        >
                          Code Editor
                        </Button>
                      </CodeEditorDialog>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(CodeExecutorNode);
