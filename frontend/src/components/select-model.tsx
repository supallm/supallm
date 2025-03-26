"use client";

import { ProviderType } from "@/core/entities/credential";
import { AnthropicModels } from "@/core/entities/flow/flow-anthropic";
import { MistralModels } from "@/core/entities/flow/flow-mistral";
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
  anthropic: AnthropicModels,
  google: [],
  azure: [],
  mistral: MistralModels,
  e2b: [],
  ollama: [],
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
