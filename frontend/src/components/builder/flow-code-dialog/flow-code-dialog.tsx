import { CodeBlock } from "@/components/ui/code-block";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EntrypointNodeData } from "@/core/entities/flow/flow-entrypoint";
import { ResultNodeData } from "@/core/entities/flow/flow-result";
import { FC, PropsWithChildren, useMemo } from "react";

export const FLowCodeDialog: FC<
  PropsWithChildren<{
    entrypointNodeData?: EntrypointNodeData;
    resultNodeData?: ResultNodeData;
    flowId: string;
  }>
> = ({ children, entrypointNodeData, resultNodeData, flowId }) => {
  const flowInputObjectExample = useMemo(() => {
    const data = entrypointNodeData;
    const handles = data?.handles;

    const inputObject: Record<string, string> = {};

    if (!handles) {
      return {};
    }

    handles.forEach((handle) => {
      let placeholder = "";

      switch (handle.type) {
        case "text":
          placeholder = "Your text input";
          break;
        case "image":
          placeholder = `Your img input data:image/png;base64,...`;
          break;
        default:
      }

      inputObject[handle.label] = placeholder;
    });

    return inputObject;
  }, [entrypointNodeData, resultNodeData]);

  const flowCodeSnippet = useMemo(() => {
    const formattedInput = JSON.stringify(flowInputObjectExample, null, 4)
      .split("\n")
      .map((line, index) => `${index === 0 ? "" : "    "}${line}`)
      .join("\n");
    return `import { supallm } from 'supallm';

const stream = supallm.run({
    flowId: '${flowId}',
    input: ${formattedInput}
});

stream.on('data', (data) => {
    console.log(data);
});
    `;
  }, [entrypointNodeData, resultNodeData]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[800px]">
        <DialogHeader>
          <DialogTitle>Flow Code</DialogTitle>
          <DialogDescription>
            This is an example snippet showing how you can use this flow using
            our SDK.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-3 border-t py-5 overflow-y-auto">
          <CodeBlock
            filename="your-code.ts"
            language="typescript"
            highlightLines={[]}
            code={flowCodeSnippet}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
