import { FlowNode } from "@/core/entities/flow";
import { parseHandleId } from "@/lib/handles";
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
} from "@xyflow/react";
import dagre from "dagre";
import { FC, useCallback, useEffect, useMemo } from "react";
import { FlowSubscription } from "supallm/browser";
import {
  isRunningFlowNodeType,
  isToolNodeType,
  RunningFlowNodeType,
} from "../node-types";
import RunningFlowNode from "./running-flow-node";

const nodeWidth = 180;
const nodeHeight = 40;

export function layoutGraphWithStandardHandles(
  nodes: Node[],
  rawEdges: Edge[],
  direction: "TB" | "LR" = "TB",
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Step 1: Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Step 2: Deduplicate edges by source-target pair
  const seen = new Set<string>();
  const dedupedEdges: Edge[] = [];

  rawEdges.forEach((edge) => {
    const { type: targetType } = parseHandleId(edge.targetHandle ?? "");

    const key = `${edge.source}->${edge.target}`;
    if (!seen.has(key)) {
      seen.add(key);
      if (targetType === "tools") {
        console.log("setting edge", edge.source, edge.target);
        const edgeCpy = { ...edge };
        const reversedEdge: Edge = {
          id: edgeCpy.id,
          source: edge.target,
          target: edge.source,
          sourceHandle: edge.targetHandle,
          targetHandle: edge.sourceHandle,
        };

        dedupedEdges.push(reversedEdge);
        dagreGraph.setEdge(reversedEdge.target, reversedEdge.source);
      } else {
        console.log("setting edge", edge.source, edge.target);
        dedupedEdges.push(edge);
        dagreGraph.setEdge(edge.target, edge.source);
      }
    }
  });

  // Step 3: Apply layout
  dagre.layout(dagreGraph);

  // Step 4: Layouted nodes with position + port positions
  const layoutedNodes: Node[] = nodes.map((node) => {
    const layout = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: layout.x - nodeWidth / 2,
        y: layout.y - nodeHeight / 2,
      },
      draggable: true,
      data: {
        status: "idle" as const,
      },
    };
  });

  // Step 5: Format layouted edges using standard top/bottom handles
  const layoutedEdges: Edge[] = dedupedEdges.map((edge) => ({
    id: `layout-edge-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: `${edge.source}-top`,
    targetHandle: `${edge.target}-bottom`,
  }));

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  };
}

export const RunningFlow: FC<{
  initialNodes: FlowNode[];
  initialEdges: Edge[];
  flowSubscription: FlowSubscription | null;
}> = ({ initialNodes, initialEdges, flowSubscription }) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } =
    layoutGraphWithStandardHandles(
      initialNodes.filter((node) => {
        return isRunningFlowNodeType(node.type) || isToolNodeType(node.type);
      }),
      initialEdges.filter((edge) => {
        const { type: targetType } = parseHandleId(edge.targetHandle ?? "");
        const { type: sourceType } = parseHandleId(edge.sourceHandle ?? "");

        const edgesToAvoid = ["ai-model", "memory"];

        return !(
          edgesToAvoid.includes(targetType) && edgesToAvoid.includes(sourceType)
        );
      }),
      "TB",
    );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);

  const setActiveNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        return nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: "active",
              },
            };
          }

          return node;
        });
      });
    },
    [setNodes],
  );

  const setEndedNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        return nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: "ended",
              },
            };
          }

          return node;
        });
      });
    },
    [setNodes],
  );

  const setFailedNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        return nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: "failed",
              },
            };
          }

          return node;
        });
      });
    },
    [setNodes],
  );

  const setWorkflowOutputStatus = useCallback(
    (status: "ended" | "failed") => {
      setNodes((nds) => {
        return nds.map((node) => {
          if (node.id === "result-node") {
            return {
              ...node,
              data: {
                ...node.data,
                status: status,
              },
            };
          }

          return node;
        });
      });
    },
    [setNodes],
  );

  useEffect(() => {
    if (!flowSubscription) return;

    const unsubscribeFlowEnd = flowSubscription.on("flowEnd", () => {
      console.log("flowEnd");
      setWorkflowOutputStatus("ended");
    });

    const unsubscribeFlowFail = flowSubscription.on("flowFail", () => {
      console.log("flowFail");
      setWorkflowOutputStatus("failed");
    });

    const unsubscribeNodeStart = flowSubscription.on(
      "nodeStart",
      ({ nodeId }) => {
        setActiveNode(nodeId);
      },
    );

    const unsubscribeNodeEnd = flowSubscription.on("nodeEnd", ({ nodeId }) => {
      setEndedNode(nodeId);
    });

    const unsubscribeNodeFail = flowSubscription.on(
      "nodeFail",
      ({ nodeId }) => {
        console.log("nodeFail", nodeId);
        setFailedNode(nodeId);
      },
    );

    return () => {
      unsubscribeNodeStart();
      unsubscribeNodeEnd();
      unsubscribeNodeFail();
      unsubscribeFlowEnd();
      unsubscribeFlowFail();
    };
  }, [
    flowSubscription,
    setActiveNode,
    setEndedNode,
    setFailedNode,
    setWorkflowOutputStatus,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeTypes: Record<RunningFlowNodeType, any> = useMemo(
    () => ({
      "chat-openai": RunningFlowNode,
      result: RunningFlowNode,
      entrypoint: RunningFlowNode,
      "user-feedback": RunningFlowNode,
      "code-executor": RunningFlowNode,
      "e2b-interpreter": RunningFlowNode,
      "http-request": RunningFlowNode,
      "chat-anthropic": RunningFlowNode,
      "chat-google": RunningFlowNode,
      "chat-azure": RunningFlowNode,
      "chat-mistral": RunningFlowNode,
      "chat-ollama": RunningFlowNode,
      "ai-agent": RunningFlowNode,
      "model-openai": RunningFlowNode,
      "http-tool": RunningFlowNode,
      "chat-openai-as-tool": RunningFlowNode,
      "sdk-notifier-tool": RunningFlowNode,
      "e2b-interpreter-tool": RunningFlowNode,
      "confluence-tool": RunningFlowNode,
      "airtable-tool": RunningFlowNode,
      "notion-database-tool": RunningFlowNode,
      "postgres-query-tool": RunningFlowNode,
      "slack-tool": RunningFlowNode,
      "e2b-code-interpreter-tool": RunningFlowNode,
    }),
    [],
  );

  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{
            maxZoom: 1,
          }}
          key={"running-flow"}
          nodes={nodes}
          edges={layoutedEdges}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};
