import { Label } from "@radix-ui/react-dropdown-menu";
import { Position } from "@xyflow/react";
import { FC, memo } from "react";
import { ProviderLogo } from "../logos/provider-logo";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import BaseNode from "./base-node";
import { BaseNodeContent } from "./base-node-content";
import { LabeledHandle } from "./labeled-handle";

export type ModelFlowNodeData = {
  type: "model";
  model: string;
  systemPrompt: string;
};

const ModelNode: FC<{ data: ModelFlowNodeData }> = ({ data }) => {
  return (
    <BaseNode
      outputLabel="Chat output"
      header={
        <>
          <ProviderLogo name="openai" />
          <span className="font-medium text-sm">Chat OpenAI</span>
        </>
      }
    >
      <LabeledHandle title="Cache" type="source" position={Position.Left} />
      <LabeledHandle
        title="Prompt"
        type="source"
        id="prompt"
        position={Position.Left}
      />
      <LabeledHandle
        title="Source files"
        type="source"
        position={Position.Left}
      />

      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <div>
            <Label className="text-sm font-medium">Credentials</Label>
            <Input placeholder="Select your API key" />
          </div>
          <div>
            <Label className="text-sm font-medium">Temperature</Label>
            <Input placeholder="1" />
          </div>
          <div>
            <Label className="text-sm font-medium">System prompt</Label>
            <Textarea placeholder="You are a useful assistant..." />
          </div>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(ModelNode);
