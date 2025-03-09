import { Button } from "@/components/ui/button";
import { Flag, PlusIcon } from "lucide-react";
import { FC, memo } from "react";
import BaseNode from "../common/base-node";

export type EntrypointNodeData = {
  type: "model";
  model: string;
  systemPrompt: string;
};

const EntrypointNode: FC<{ data: EntrypointNodeData }> = ({ data }) => {
  return (
    <BaseNode
      inputHandles={[]}
      outputHandles={[
        {
          label: "Prompt",
          id: "requestPrompt",
        },
        {
          label: "Image",
          id: "image",
        },
      ]}
      header={
        <>
          <Flag className="w-4 h-4" />
          <span className="font-medium text-sm">Entrypoint</span>
        </>
      }
    >
      <div>
        <Button startContent={<PlusIcon className="w-4 h-4" />}>
          Add input parameter
        </Button>
      </div>
    </BaseNode>
  );
};

export default memo(EntrypointNode);
