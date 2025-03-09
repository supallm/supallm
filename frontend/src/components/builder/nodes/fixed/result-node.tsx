import { FolderSymlink } from "lucide-react";
import { FC, memo } from "react";
import BaseNode from "../common/base-node";

export type ModelFlowNodeData = {
  type: "model";
  model: string;
  systemPrompt: string;
};

const ResultNode: FC<{ data: ModelFlowNodeData }> = ({ data }) => {
  return (
    <BaseNode
      outputHandles={[]}
      inputHandles={[
        {
          label: "Result",
          id: "result",
          tooltip: (
            <p>
              This is the final result of the flow that will be sent to your
              user
            </p>
          ),
        },
      ]}
      header={
        <>
          <FolderSymlink className="w-4 h-4" />
          <span className="font-medium text-sm">Final result</span>
        </>
      }
    ></BaseNode>
  );
};

export default memo(ResultNode);
