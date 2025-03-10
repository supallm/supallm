"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FormControl, FormLabel } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type AppSelectSize = "sm" | "md";

export function AppSelect<T extends string>(props: {
  onValueChange: (value: T) => void;
  defaultValue: T;
  choices: {
    value: T;
    label: string;
  }[];
  label?: string;
  size?: AppSelectSize;
  placeholder?: string;
}) {
  const sizeClasses: Record<AppSelectSize, string> = {
    sm: "h-7 rounded-sm",
    md: "h-9 rounded-md",
  } as const;

  const sizeClass = sizeClasses[props.size ?? "md"];

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
        <FormControl className={cn("w-full", sizeClass)}>
          <SelectTrigger>
            <SelectValue
              placeholder={props.placeholder ?? "Select an option"}
            />
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
