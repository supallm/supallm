import { generateHandleId } from "@/lib/handles";
import { NodeProps } from "@xyflow/react";
import { UserCheck } from "lucide-react";
import { FC, memo } from "react";
import BaseNode, { BaseNodeHandle } from "../common/base-node";
import { BaseNodeContent } from "../common/base-node-content";

type Props = NodeProps & {
  data: {
    code: string;
    inputs: Array<BaseNodeHandle>;
    outputs: Array<BaseNodeHandle>;
  };
};

const inputHandles: BaseNodeHandle[] = [
  {
    id: generateHandleId("text", "input"),
    label: "input",
    type: "text",
  },
];

const outputHandles: BaseNodeHandle[] = [
  {
    id: generateHandleId("text", "onEdit"),
    label: "onEdit",
    type: "text",
  },
  {
    id: generateHandleId("text", "onAccept"),
    label: "onAccept",
    type: "text",
  },
];

const UserFeedbackNode: FC<Props> = ({ id: nodeId }) => {
  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={outputHandles}
      inputHandles={inputHandles}
      header={
        <>
          <UserCheck width={15} height={15} />
          <span className="font-medium text-sm">User feedback</span>
        </>
      }
    >
      <BaseNodeContent></BaseNodeContent>
    </BaseNode>
  );
};

export default memo(UserFeedbackNode);
