"use client";

import { AddNodeDialog } from "@/components/builder/add-node-dialog/add-node-dialog";
import { AvailableNode } from "@/components/builder/add-node-dialog/available-nodes";
import { NODE_WIDTH } from "@/components/builder/constants";
import { NodeType } from "@/components/builder/node-types";
import { default as openAIChatCompletionNode } from "@/components/builder/nodes/chat/openai-chat-completion-node";
import customCodeNode from "@/components/builder/nodes/code/custom-code-node/custom-code-node";
import entrypointNode from "@/components/builder/nodes/fixed/entrypoint-node";
import resultNode from "@/components/builder/nodes/fixed/result-node";
import httpRequestNode from "@/components/builder/nodes/utilities/http-request-node/http-request-node";
import { TestFlowDialog } from "@/components/builder/test-flow-dialog/test-flow-dialog";
import { Button } from "@/components/ui/button";
import { FlowEdge, FlowNode } from "@/core/entities/flow";
import { EntrypointNodeData } from "@/core/entities/flow/flow-entrypoint";
import { useCurrentFlowStore } from "@/core/store/flow";
import { patchFlowUsecase } from "@/core/usecases";
import { hookifyFunction } from "@/hooks/hookify-function";
import { useCurrentProjectOrThrow } from "@/hooks/use-current-project-or-throw";
import { parseHandleId } from "@/lib/handles";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  IsValidConnection,
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
import { PlayIcon, PlusIcon, SaveIcon } from "lucide-react";

import { useCallback, useMemo } from "react";

const ChatFlowPage = () => {
  /**
   * Current flow is set while fetching the flow using the FlowOnly guard
   * At this point it MUST be set to the current flow
   */
  const { currentFlow } = useCurrentFlowStore();
  const { id: projectId } = useCurrentProjectOrThrow();

  if (!currentFlow) {
    throw new Error(
      "Current flow is not set. Make sure this component is used inside a <FlowOnly /> guard component.",
    );
  }

  const { execute: saveFlow, isLoading: isSaving } = hookifyFunction(
    patchFlowUsecase.execute.bind(patchFlowUsecase),
  );

  const [nodes, , onNodesChange] = useNodesState(currentFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentFlow.edges);

  const store = useStoreApi();
  const { screenToFlowPosition, addNodes } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      return setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValidConnection: IsValidConnection<any> = (params: Connection) => {
    const { sourceHandle, targetHandle } = params;

    if (!sourceHandle || !targetHandle) {
      return params.source !== params.target;
    }

    const { type: sourceType } = parseHandleId(sourceHandle);

    /**
     * Same node handles cannot be connected together
     */
    if (params.source === params.target) {
      return false;
    }

    /**
     * We can connect outputHandle to any inputHandle with an "any" type
     */
    if (sourceType === "any") {
      return true;
    }

    const { type: targetType } = parseHandleId(targetHandle);

    return sourceType === targetType;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeTypes: Record<NodeType, any> = useMemo(
    () => ({
      "chat-openai": openAIChatCompletionNode,
      result: resultNode,
      entrypoint: entrypointNode,
      "custom-code": customCodeNode,

      "http-request": httpRequestNode,
      "chat-anthropic": () => null,
      "chat-google": () => null,
      "chat-azure": () => null,
    }),
    [],
  );

  const handleNodeChange = (changes: NodeChange<FlowNode>[]) => {
    onNodesChange(changes);
  };

  const handleEdgeChange = (changes: EdgeChange<FlowEdge>[]) => {
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

      const newNode = {
        id: crypto.randomUUID(),
        type: node.type,
        data: {},
        position: { x: centerCoords.x, y: centerCoords.y },
        zIndex: nodes.length + 1,
      };

      addNodes([newNode]);
    }
  };

  const onNodeSelected = (node: AvailableNode) => {
    addNode(node);
  };

  const onSave = () => {
    saveFlow(projectId, currentFlow.id, {
      nodes,
      edges,
      name: currentFlow.name,
    });
  };

  const entrypointNodeData = useMemo(
    () =>
      nodes.find((node) => node.type === "entrypoint")?.data as
        | EntrypointNodeData
        | undefined,
    [nodes],
  );

  return (
    <div className="h-screen w-screen pt-[40px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodeChange}
        onEdgesChange={handleEdgeChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
      >
        <Panel position="top-left">
          <AddNodeDialog onNodeSelected={onNodeSelected}>
            <Button startContent={<PlusIcon className="w-4 h-4" />}>
              Add node
            </Button>
          </AddNodeDialog>
        </Panel>
        <Panel position="top-right">
          <div className="space-x-2">
            <TestFlowDialog
              data={entrypointNodeData}
              onChange={() => {}}
              flowId={currentFlow.id}
            >
              <Button
                variant={"outline"}
                startContent={<PlayIcon className="w-4 h-4" />}
              >
                Test and integrate
              </Button>
            </TestFlowDialog>
            <Button
              isLoading={isSaving}
              onClick={onSave}
              startContent={<SaveIcon className="w-4 h-4" />}
              variant={"outline"}
            >
              Save
            </Button>
          </div>
        </Panel>
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ChatFlowPage;
