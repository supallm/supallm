"use client";

import { AddNodeDialog } from "@/components/builder/add-node-dialog/add-node-dialog";
import { AvailableNode } from "@/components/builder/add-node-dialog/available-nodes";
import { NODE_WIDTH } from "@/components/builder/constants";
import { NodeType } from "@/components/builder/node-types";
import openAIChatCompletionNode from "@/components/builder/nodes/chat/openai-chat-completion-node";
import entrypointNode from "@/components/builder/nodes/fixed/entrypoint-node";
import resultNode from "@/components/builder/nodes/fixed/result-node";
import { Button } from "@/components/ui/button";
import { FlowNode } from "@/core/entities/flow";
import { useCurrentFlowStore } from "@/core/store/flow";
import { patchFlowUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  MiniMap,
  NodeChange,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PlusIcon, SaveIcon } from "lucide-react";

import { useCallback, useMemo } from "react";

const ChatFlowPage = () => {
  /**
   * Current flow is set while fetching the flow using the FlowOnly guard
   * At this point it MUST be set to the current flow
   */
  const { currentFlow } = useCurrentFlowStore();

  if (!currentFlow) {
    throw new Error(
      "Current flow is not set. Make sure this component is used inside a <FlowOnly /> guard component.",
    );
  }

  const { execute: saveFlow, isLoading: isSaving } = hookifyFunction(
    patchFlowUsecase.execute.bind(patchFlowUsecase),
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(currentFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentFlow.edges);

  const store = useStoreApi();
  const { screenToFlowPosition, addNodes } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes: Record<NodeType, any> = useMemo(
    () => ({
      "chat-openai": openAIChatCompletionNode,
      result: resultNode,
      // promptTemplateNode: promptTemplateNode,
      entrypoint: entrypointNode,
      "chat-anthropic": () => null,
      "chat-google": () => null,
      "chat-azure": () => null,
    }),
    [],
  );

  const handleNodeChange = (changes: NodeChange<FlowNode>[]) => {
    onNodesChange(changes);
  };

  const handleEdgeChange = (changes: EdgeChange[]) => {
    onEdgesChange(changes);
  };

  const addNode = (node: AvailableNode) => {
    const { domNode } = store.getState();
    const boundingRect = domNode?.getBoundingClientRect();

    if (boundingRect) {
      const center = screenToFlowPosition({
        x: boundingRect.x + boundingRect.width / 2,
        y: boundingRect.y + boundingRect.height / 2,
      });

      const centerCoords = {
        x: center.x - NODE_WIDTH / 2,
        y: center.y - NODE_WIDTH / 2,
      };

      addNodes([
        {
          id: crypto.randomUUID(),
          type: node.type,
          data: {},
          position: { x: centerCoords.x, y: centerCoords.y },
          zIndex: nodes.length + 1,
        },
      ]);
    }
  };

  const onNodeSelected = (node: AvailableNode) => {
    addNode(node);
  };

  const onSave = () => {
    saveFlow(currentFlow.id, {
      nodes,
      edges,
    });
  };

  return (
    <div className="h-screen w-screen pt-[40px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodeChange}
        onEdgesChange={handleEdgeChange}
        onConnect={onConnect}
      >
        <Panel position="top-left">
          <AddNodeDialog onNodeSelected={onNodeSelected}>
            <Button startContent={<PlusIcon className="w-4 h-4" />}>
              Add node
            </Button>
          </AddNodeDialog>
        </Panel>
        <Panel position="top-right">
          <Button
            isLoading={isSaving}
            onClick={onSave}
            startContent={<SaveIcon className="w-4 h-4" />}
            variant={"outline"}
          >
            Save
          </Button>
        </Panel>
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ChatFlowPage;
