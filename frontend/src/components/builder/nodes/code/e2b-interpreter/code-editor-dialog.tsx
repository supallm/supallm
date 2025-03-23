import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { executeCodeSandboxUsecase } from "@/core/usecases";
import {
  parseCodeForInputs,
  parseCodeForRequiredModules,
  parseFunctionOutput,
  TypeScriptType,
} from "@/lib/typescript-utils";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import MonacoEditor from "@monaco-editor/react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { BracesIcon, Logs, PlayIcon } from "lucide-react";
import { FC, PropsWithChildren, useMemo, useState } from "react";
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

export const CodeEditorDialog: FC<
  PropsWithChildren<{
    data: {
      code: string;
    };
    onChange: (values: {
      code: string;
      inputs: Array<{
        name: string;
        type: TypeScriptType;
      }>;
      requiredModules: string[];
      functionOutput: { keys: string[] };
    }) => void;
  }>
> = ({ children, data, onChange }) => {
  const [open, setOpen] = useState(false);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [testFormInputValues, setTestFormInputValues] = useState<
    Record<string, string>
  >({});

  const [logs, setLogs] = useState<string[]>([]);
  const clearLogs = () => {
    setLogs([]);
  };
  const addLog = (log: string) => {
    setLogs((prev) => [...prev, log]);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: data.code ?? "",
    },
  });

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  const code = form.watch("code");

  const inputs = useMemo(() => parseCodeForInputs(code), [code]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const inputs = parseCodeForInputs(values.code);

    const requiredModules = parseCodeForRequiredModules(values.code);
    const outputs = parseFunctionOutput(values.code, "main");

    console.log("outputs", outputs);

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

  const handleRunCode = () => {
    clearLogs();
    setActivePane("logs");
    setIsCodeRunning(true);
    executeCodeSandboxUsecase.execute({
      code: form.getValues("code"),
      language: "typescript",
      projectId: "1",
      inputs: testFormInputValues,
      onLog: addLog,
      onResult: (log: string) => {
        setIsCodeRunning(false);
        addLog(log);
      },
      onError: addLog,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="w-3/4 max-w-[900px] gap-0"
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
              {/* Top Part */}
              <div className="p-4 left-0 right-0 max-h-[50%] top-0 space-y-4 overflow-y-auto">
                {!inputs?.length && (
                  <EmptyState
                    title="No inputs found"
                    description="Add at least one argument to your main function"
                  ></EmptyState>
                )}
                {!!inputs?.length && (
                  <>
                    {inputs.map((input) => {
                      return (
                        <div key={input.name}>
                          <Label className="mb-2">
                            {input.name}{" "}
                            <span className="text-xs text-gray-500">
                              ({input.type})
                            </span>
                          </Label>
                          <Input
                            value={testFormInputValues[input.name] ?? ""}
                            onChange={(e) =>
                              setTestFormInputValues({
                                ...testFormInputValues,
                                [input.name]: e.target.value,
                              })
                            }
                            placeholder="Enter value"
                          />
                        </div>
                      );
                    })}

                    <Button
                      type="button"
                      variant={"outline"}
                      startContent={<PlayIcon className="w-4 h-4" />}
                      onClick={handleRunCode}
                      isLoading={isCodeRunning}
                    >
                      Test function
                    </Button>
                  </>
                )}
              </div>

              {/* Bottom Part */}
              <div className="bg-muted grow border-t absolute bottom-0 left-0 right-0 top-[50%] flex flex-col">
                <div className="pane-controls w-full flex justify-start gap-0 border-b items-center bg-gray-100 shrink-0">
                  <PaneButton
                    active={activePane === "source-code"}
                    onClick={() => setActivePane("source-code")}
                    startContent={<BracesIcon className="w-4 h-4" />}
                  >
                    Code editor
                  </PaneButton>
                  <PaneButton
                    active={activePane === "logs"}
                    onClick={() => setActivePane("logs")}
                    startContent={<Logs className="w-4 h-4" />}
                  >
                    Execution logs
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
                            onChange={(value) => field.onChange(value)}
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

                  {activePane === "logs" && (
                    <div className="h-full p-4 grow text-sm flex flex-col gap-2">
                      {logs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
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
