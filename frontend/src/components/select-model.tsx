"use client";

import { ProviderType } from "@/core/entities/credential";
import { OpenAIModels } from "@/core/entities/flow/flow-openai";
import { FC, useMemo } from "react";
import { FormControl } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const ProviderModels: Record<ProviderType, Readonly<string[]>> = {
  openai: OpenAIModels,
  anthropic: [],
  google: [],
  azure: [],
  mistral: [],
};

export const SelectModel: FC<{
  onValueChange: (value: string) => void;
  defaultValue: string;
  providerType: ProviderType;
}> = ({ onValueChange, defaultValue, providerType }) => {
  const models = useMemo(() => {
    return ProviderModels[providerType];
  }, [providerType]);

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <FormControl className="w-full">
        <SelectTrigger>
          <SelectValue placeholder="Select the model to use" />
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
