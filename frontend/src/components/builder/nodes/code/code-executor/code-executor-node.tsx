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
import { NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { Code } from "lucide-react";
import { FC, memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode, { BaseNodeHandle } from "../../common/base-node";
import { BaseNodeContent } from "../../common/base-node-content";
import { CodeEditorDialog } from "./code-editor-dialog";
import { CodePreview } from "./code-preview";

type CustomCodeNodeProps = NodeProps & {
  data: {
    code: string;
    inputs: Array<BaseNodeHandle>;
    outputs: Array<BaseNodeHandle>;
    requiredModules: string[];
  };
};

const defaultCode = `// You can import modules like this:
// import Papa from 'papaparse';

// Your code *MUST* export a function called "main".
// The arguments of this function will be the inputs of the node.
export async function main(myString: string, myNumber: number) {

    // You *MUST* return an object with the keys you want to expose as outputs.
    return {
        result: "Hello world",
    }
}`;

const CodeExecutorNode: FC<CustomCodeNodeProps> = ({ data, id: nodeId }) => {
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const formSchema = z.object({
    code: z.string().min(1, "Code cannot be empty"),
    inputs: z.array(
      z.object({
        type: z.string(),
        label: z.string(),
        id: z.string(),
      }),
    ),
    outputs: z.array(
      z.object({
        type: z.string(),
        label: z.string(),
        id: z.string(),
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

  const [inputHandles, setInputHandles] = useState(data.inputs ?? []);

  const [outputHandles, setOutputHandles] = useState<BaseNodeHandle[]>(
    data.outputs ?? [
      {
        label: "result",
        id: generateHandleId("any", "result"),
        type: "any",
      },
    ],
  );

  form.watch(() => {
    const formValues = form.getValues();
    const data = {
      code: formValues.code,
    };

    console.log("CHANGES", data);
    updateNodeData(nodeId, data);
  });

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [nodeId, inputHandles, updateNodeInternals]);

  return (
    <BaseNode
      outputHandles={outputHandles.map((output) => {
        return {
          label: output.label,
          id: output.id,
          type: "any",
        };
      })}
      inputHandles={inputHandles.map((input) => ({
        label: input.label,
        id: input.id,
        type: "any",
      }))}
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
                        onChange={(values) => {
                          field.onChange(values.code);
                          if (!!values.outputs?.keys?.length) {
                            setOutputHandles(
                              values.outputs.keys.map((key) => ({
                                label: sanitizeHandleLabel(key),
                                id: generateHandleId("any", key),
                                type: "any",
                              })),
                            );
                          }
                          if (!!values.inputs?.length) {
                            setInputHandles(
                              values.inputs.map((input) => ({
                                label: sanitizeHandleLabel(input.name),
                                id: generateHandleId("any", input.name),
                                // We set all handle to "any" so it's user's responsibility to set the correct type.
                                type: "any",
                              })),
                            );
                          }

                          // updateNodeData(nodeId, {
                          //   ...data,
                          //   inputs: values.inputs,
                          //   requiredModules: values.requiredModules,
                          // });
                        }}
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
