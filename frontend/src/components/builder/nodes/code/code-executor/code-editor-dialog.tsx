import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getFunctionReturnLines,
  parseCodeForInputs,
  parseCodeForRequiredModules,
  parseFunctionOutput,
} from "@/lib/typescript-utils";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { BracesIcon } from "lucide-react";
import { FC, PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
});

const PaneButton: FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  startContent?: React.ReactNode;
}> = ({ active, onClick, children, startContent }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 cursor-pointer hover:bg-gray-200 text-gray-700 flex items-center gap-1 text-sm",
        active ? "bg-gray-200 text-gray-900" : "bg-gray-100",
      )}
    >
      {startContent}
      {children}
    </button>
  );
};

export type CodeEditorOnChangeParams = {
  code: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
  requiredModules: string[];
  outputs: { keys: string[] };
};

export const CodeEditorDialog: FC<
  PropsWithChildren<{
    data: {
      code: string;
    };
    onChange: (values: CodeEditorOnChangeParams) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: data.code ?? "",
    },
  });

  const monaco = useMonaco();

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const inputs = parseCodeForInputs(values.code);

    const requiredModules = parseCodeForRequiredModules(values.code);
    const outputs = parseFunctionOutput(values.code, "main");

    onChange({
      ...values,
      inputs,
      requiredModules,
      outputs,
    });

    setOpen(false);
  };

  const [activePane, setActivePane] = useState<"source-code" | "logs">(
    "source-code",
  );

  const setMonacoReturnFunctionError = (
    startLineNumber: number,
    endLineNumber: number,
  ) => {
    if (monaco) {
      const model = monaco.editor.getModels()[0];
      monaco.editor.setModelMarkers(model, "owner", [
        {
          startLineNumber,
          startColumn: 1,
          endLineNumber,
          endColumn: 100,
          code: "return-must-be-object",
          message: `You must return an object with the key(s) you want to expose as outputs.

Example:
    return {
      output1: [1,2,3],
      output2: { something: "else" },
    }
`,
          severity: monaco.MarkerSeverity.Error,
        },
      ]);
    }
  };

  const clearMonacoReturnFunctionError = () => {
    if (monaco) {
      const model = monaco.editor.getModels()[0];
      monaco.editor.setModelMarkers(model, "owner", []);
    }
  };

  const onCodeChange = (value: string | undefined) => {
    if (!value) return;

    form.setValue("code", value);
    const { keys } = parseFunctionOutput(value);
    if (!keys.length) {
      const { startLine, endLine } = getFunctionReturnLines(value);
      console.log("startLine", startLine, "endLine", endLine);
      setMonacoReturnFunctionError(startLine, endLine);
    } else {
      clearMonacoReturnFunctionError();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="w-3/4 gap-0"
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <Form {...form}>
          <SheetHeader className="border-b">
            <SheetTitle>Code Editor</SheetTitle>
            <SheetDescription>
              Edit your TypeScript code. Ensure it contains a main() function.
            </SheetDescription>
          </SheetHeader>
          <div className="h-full relative">
            <div className="absolute top-0 left-0 right-0 bottom-0">
              <div className="bg-muted grow absolute bottom-0 left-0 right-0 top-0 flex flex-col">
                <div className="pane-controls w-full flex justify-start gap-0 border-b items-center bg-gray-100 shrink-0">
                  <PaneButton
                    active={activePane === "source-code"}
                    onClick={() => setActivePane("source-code")}
                    startContent={<BracesIcon className="w-4 h-4" />}
                  >
                    Code editor
                  </PaneButton>
                </div>

                <div className="grow">
                  {activePane === "source-code" && (
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="h-full"
                    >
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <MonacoEditor
                            height="100%"
                            language="typescript"
                            value={field.value}
                            onChange={onCodeChange}
                            options={{
                              automaticLayout: true,
                              minimap: { enabled: false },
                              wordWrap: "on",
                            }}
                          />
                        )}
                      />
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t shrink-0">
            <div className="flex justify-end gap-2 items-center">
              <Button onClick={() => setOpen(false)} variant={"outline"}>
                Cancel
              </Button>
              <Button onClick={form.handleSubmit(onSubmit)} type="button">
                Save
              </Button>
            </div>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
