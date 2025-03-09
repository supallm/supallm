import { AppSelect } from "@/components/app-select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  EntrypointHandle,
  EntrypointNodeData,
} from "@/core/entities/flow/flow-entrypoint";
import { toSanitizedCamelCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, Flag, XIcon } from "lucide-react";
import { FC, memo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BaseNode from "../common/base-node";

const ParameterInput: FC<{
  onChange: (value: EntrypointHandle) => void;
}> = ({ onChange }) => {
  const [handleType, setHandleType] =
    useState<EntrypointHandle["type"]>("text");
  const [handleLabel, setHandleLabel] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!handleLabel.length || !handleType) return;

    const id = toSanitizedCamelCase(handleLabel);
    // Here we use the camelCase value for the label,
    // because it will be easier to understand in the UI
    const label = id;

    onChange({ type: handleType, label: label, id });
    reset();
  };

  const reset = () => {
    setHandleLabel("");
    setHandleType("text");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <Input
          ref={inputRef}
          onChange={(e) => setHandleLabel(e.target.value)}
        />
        <AppSelect
          onValueChange={(value) => setHandleType(value)}
          defaultValue={handleType}
          choices={[
            { value: "image", label: "Image" },
            { value: "text", label: "Text" },
          ]}
        />
      </div>
      <Button
        className="w-full"
        disabled={!handleLabel.length || !handleType.length}
        size="sm"
        variant="outline"
        startContent={<CheckIcon />}
        onClick={submit}
      >
        Add
      </Button>
    </div>
  );
};

const EntrypointNode: FC<{ data: EntrypointNodeData }> = ({ data }) => {
  const formSchema = z.object({
    handles: z.array(
      z.object({
        type: z.enum(["text", "image"]),
        id: z.string(),
        label: z.string(),
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handles: data.handles ?? [
        {
          type: "text",
          id: "prompt",
          label: "prompt",
        },
      ],
    },
  });

  const formHandles = form.watch("handles");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit");
    console.log(values);
  }

  const onHandleChange = (handle: EntrypointHandle) => {
    const index = formHandles.findIndex((h) => h.id === handle.id);
    if (index === -1) {
      form.setValue("handles", [...formHandles, handle]);
    } else {
      form.setValue("handles", [...formHandles.slice(0, index), handle]);
    }
  };

  const removeHandle = (id: string) => {
    form.setValue(
      "handles",
      formHandles.filter((handle) => handle.id !== id),
    );
  };

  return (
    <BaseNode
      inputHandles={[]}
      outputHandles={formHandles}
      header={
        <>
          <Flag className="w-4 h-4" />
          <span className="font-medium text-sm">Entrypoint</span>
        </>
      }
    >
      <div>
        <Form {...form}>
          <ParameterInput onChange={onHandleChange} />
        </Form>

        <div className="flex flex-col gap-1 mt-2">
          {formHandles.map((handle) => (
            <div key={handle.id}>
              <Button
                variant="outline"
                size="xs"
                endContent={<XIcon />}
                onClick={() => removeHandle(handle.id)}
              >
                {handle.label}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(EntrypointNode);
