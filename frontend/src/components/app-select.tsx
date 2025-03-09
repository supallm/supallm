"use client";

import { useEffect, useState } from "react";
import { FormControl, FormLabel } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function AppSelect<T extends string>(props: {
  onValueChange: (value: T) => void;
  defaultValue: T;
  choices: {
    value: T;
    label: string;
  }[];
  label?: string;
}) {
  const { onValueChange, defaultValue, choices, label } = props;
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        value={value}
      >
        <FormControl className="w-full">
          <SelectTrigger>
            <SelectValue placeholder="Select the model to use" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="w-full">
          {choices.map((choice) => (
            <SelectItem
              key={`${choice.value}-${choice.label}`}
              value={choice.value}
            >
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
