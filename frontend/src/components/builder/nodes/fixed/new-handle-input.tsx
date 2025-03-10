import { AppSelect } from "@/components/app-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntrypointHandle } from "@/core/entities/flow/flow-entrypoint";
import { toSanitizedCamelCase } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { FC, useRef, useState } from "react";

export const NewHandleInput: FC<{
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
          inputSize={"sm"}
          ref={inputRef}
          onChange={(e) => setHandleLabel(e.target.value)}
        />
        <AppSelect
          size={"sm"}
          onValueChange={(value) => setHandleType(value)}
          defaultValue={handleType}
          choices={[
            { value: "image", label: "Image" },
            { value: "text", label: "Text" },
          ]}
        />
      </div>
      <Button
        size="xs"
        className="w-full"
        disabled={!handleLabel.length || !handleType.length}
        variant="outline"
        startContent={<CheckIcon />}
        onClick={submit}
      >
        Add
      </Button>
    </div>
  );
};
