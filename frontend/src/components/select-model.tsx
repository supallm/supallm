"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { FC, useMemo } from "react";
import { FormControl } from "./ui/form";
import { LLMProviderName } from "@/core/entities/llm-provider";

export const ProviderModels: Record<LLMProviderName, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini"],
  anthropic: [],
  google: [],
  azure: [],
  mistral: [],
};

export const SelectModel: FC<{
  onValueChange: (value: string) => void;
  defaultValue: string;
  providerType: LLMProviderName;
}> = ({ onValueChange, defaultValue, providerType }) => {
  const models = useMemo(() => {
    return ProviderModels[providerType];
  }, [providerType]);

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <FormControl className="w-full">
        <SelectTrigger>
          <SelectValue placeholder="Select a verified email to display" />
        </SelectTrigger>
      </FormControl>
      <SelectContent className="w-full">
        {models.map((model) => (
          <SelectItem key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
