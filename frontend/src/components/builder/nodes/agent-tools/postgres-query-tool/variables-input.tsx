import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FC, useMemo, useState } from "react";

export const VariablesInput: FC<{
  variables: { name: string; description: string }[];
  onChange: (variables: { name: string; description: string }[]) => void;
}> = ({ variables, onChange }) => {
  const deduplicatedVariables = useMemo(() => {
    const value = variables.filter(
      (variable, index, self) =>
        index === self.findIndex((t) => t.name === variable.name),
    );
    return value;
  }, [variables]);

  const [, setValues] = useState<{ name: string; description: string }[]>(
    deduplicatedVariables,
  );

  const setVariable = (name: string, description: string) => {
    setValues((prev) => {
      const newValues = [...prev];
      const index = newValues.findIndex((v) => v.name === name);
      if (index === -1) {
        newValues.push({ name, description });
      } else {
        newValues[index].description = description;
      }

      onChange(newValues);

      return newValues;
    });
  };

  return (
    <div>
      <div>
        <div className="flex flex-col gap-2">
          {deduplicatedVariables.map((variable, index) => {
            return (
              <FormItem key={variable.name + index}>
                <FormLabel className="text-muted-foreground">
                  {variable.name}
                </FormLabel>
                <FormControl>
                  <Input
                    autoFocus={false}
                    type="text"
                    placeholder="e.g. Replace this variable by the name of the product the user is looking for"
                    value={variable.description}
                    onChange={(e) => {
                      setVariable(variable.name, e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            );
          })}
        </div>
      </div>
    </div>
  );
};
