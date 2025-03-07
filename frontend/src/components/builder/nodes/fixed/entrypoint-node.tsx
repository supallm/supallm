import { Flag } from "lucide-react";
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
      noInput
      outputLabel="Request prompt"
      header={
        <>
          <Flag className="w-4 h-4" />
          <span className="font-medium text-sm">Entrypoint</span>
        </>
      }
    ></BaseNode>
  );
};

export default memo(EntrypointNode);
