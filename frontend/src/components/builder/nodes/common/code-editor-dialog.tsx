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
  parseCodeForInputs,
  parseCodeForRequiredModules,
  parseFunctionOutput,
} from "@/lib/typescript-utils";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { BracesIcon } from "lucide-react";
import { FC, PropsWithChildren, useEffect, useState } from "react";
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
    title: string;
    description: string;
    language: "typescript" | "pgsql";
    data: {
      code: string;
    };
    onChange: (values: CodeEditorOnChangeParams) => void;
  }>
> = ({ children, data, onChange, language, title, description }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: data.code ?? "",
    },
  });

  const monaco = useMonaco();

  const [isMonacoSetup, setIsMonacoSetup] = useState(false);

  useEffect(() => {
    if (monaco && !isMonacoSetup) {
      monaco.languages.register({ id: "pgsql" });

      const pgKeywords = [
        "SELECT",
        "FROM",
        "WHERE",
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATE",
        "TABLE",
        "DROP",
        "ALTER",
        "JOIN",
        "LEFT JOIN",
        "RIGHT JOIN",
        "INNER JOIN",
        "OUTER JOIN",
        "GROUP BY",
        "ORDER BY",
        "LIMIT",
        "OFFSET",
        "DISTINCT",
        "AND",
        "OR",
        "NOT",
      ];

      monaco.languages.registerCompletionItemProvider("pgsql", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = pgKeywords.map((keyword) => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range,
          }));

          return { suggestions };
        },
      });

      setIsMonacoSetup(true);
    }
  }, [monaco, isMonacoSetup]);

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

  const onCodeChange = (value: string | undefined) => {
    if (!value) return;

    form.setValue("code", value);
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
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
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
                    {language === "typescript" ? "TypeScript" : "SQL"} editor
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
                            language={language}
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
