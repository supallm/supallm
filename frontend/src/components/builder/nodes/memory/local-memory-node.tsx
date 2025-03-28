import { generateHandleId } from "@/lib/handles";
import { NodeProps, Position } from "@xyflow/react";
import { Database } from "lucide-react";
import { FC, memo } from "react";
import BaseNode, { BaseNodeHandle } from "../common/base-node";

type Props = NodeProps & {
  data: {
    code: string;
    inputs: Array<BaseNodeHandle>;
    outputs: Array<BaseNodeHandle>;
  };
};

const inputHandles: BaseNodeHandle[] = [];

const outputHandles: BaseNodeHandle[] = [
  {
    id: generateHandleId("memory", "connection"),
    label: "AI Agent",
    type: "memory",
    position: Position.Right,
  },
];

const LocalMemoryNode: FC<Props> = ({ data, id: nodeId }) => {
  return (
    <BaseNode
      nodeId={nodeId}
      outputHandles={outputHandles}
      inputHandles={inputHandles}
      noLabel
      header={
        <>
          <Database width={15} height={15} />
          <span className="font-medium text-sm">Supallm Memory</span>
        </>
      }
    ></BaseNode>
  );
};

export default memo(LocalMemoryNode);
