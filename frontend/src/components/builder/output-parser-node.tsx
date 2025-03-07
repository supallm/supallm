import { Label } from "@radix-ui/react-dropdown-menu";
import { Position } from "@xyflow/react";
import { BracesIcon } from "lucide-react";
import { FC, memo } from "react";
import { Textarea } from "../ui/textarea";
import BaseNode from "./base-node";
import { BaseNodeContent } from "./base-node-content";
import { LabeledHandle } from "./labeled-handle";

const OutputParserNode: FC = () => {
  return (
    <BaseNode
      header={
        <>
          <BracesIcon className="w-4 h-4" />
          <span className="font-medium text-sm">Output Parser</span>
        </>
      }
      outputLabel="Output"
    >
      <LabeledHandle
        title="Chat Model Result"
        type="source"
        position={Position.Left}
      />

      <BaseNodeContent>
        <div className="flex flex-col gap-2">
          <div>
            <Label className="text-sm font-medium">Zod schema</Label>
            <Textarea
              placeholder="z.object({
              name: z.string(),
              age: z.number(),
            })"
            />
          </div>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
};

export default memo(OutputParserNode);
