import { Position } from "@xyflow/react";
import { FolderSymlink } from "lucide-react";
import { FC, memo } from "react";
import BaseNode from "./base-node";
import { LabeledHandle } from "./labeled-handle";

export type ModelFlowNodeData = {
  type: "model";
  model: string;
  systemPrompt: string;
};

const ResultNode: FC<{ data: ModelFlowNodeData }> = ({ data }) => {
  return (
    <BaseNode
      noOutput
      outputLabel="Chat output"
      header={
        <>
          <FolderSymlink className="w-4 h-4" />
          <span className="font-medium text-sm">Final result</span>
        </>
      }
    >
      <LabeledHandle title="Result" type="source" position={Position.Left} />
    </BaseNode>
  );
};

export default memo(ResultNode);
