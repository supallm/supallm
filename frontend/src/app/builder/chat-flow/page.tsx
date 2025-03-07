"use client";

import { AddNodeDialog } from "@/components/builder/add-node-dialog/add-node-dialog";
import { AvailableNode } from "@/components/builder/add-node-dialog/available-nodes";
import entrypointNode from "@/components/builder/entrypoint-node";
import modelNode from "@/components/builder/model-node";
import { NodeType } from "@/components/builder/node-types";
import resultNode from "@/components/builder/result-node";
import { Button } from "@/components/ui/button";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MiniMap,
  Node,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PlusIcon } from "lucide-react";

import { useCallback } from "react";

const initialNodes: (Node & { type: NodeType })[] = [
  {
    id: "entrypoint",
    type: "entrypoint",
    data: {},
    position: { x: 100, y: 200 },
    deletable: false,
  },
  {
    id: "result",
    type: "result",
    data: {},
    position: { x: 900, y: 200 },
    deletable: false,
  },
];

const initialEdges = [
  { id: "e1-2", source: "prompt", target: "model", targetHandle: "prompt" },
];

const ChatFlowPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes: Record<NodeType, any> = {
    "chat-openai": modelNode,
    result: resultNode,
    // promptTemplateNode: promptTemplateNode,
    entrypoint: entrypointNode,
    "chat-anthropic": () => null,
    "chat-google": () => null,
    "chat-azure": () => null,
  };

  const addNode = (node: AvailableNode) => {
    setNodes((nds) => [
      ...nds,
      {
        id: node.name,
        type: node.type,
        data: {},
        position: { x: 500, y: 300 },
      },
    ]);
  };

  const onNodeSelected = (node: AvailableNode) => {
    addNode(node);
  };

  return (
    <div className="h-screen w-screen pt-[40px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Panel position="top-left">
          <AddNodeDialog onNodeSelected={onNodeSelected}>
            <Button startContent={<PlusIcon className="w-4 h-4" />}>Add</Button>
          </AddNodeDialog>
        </Panel>
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ChatFlowPage;
