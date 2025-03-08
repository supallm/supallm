"use client";

import { FormControl } from "./ui/form";
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
}) {
  const { onValueChange, defaultValue, choices } = props;

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
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
  );
}
