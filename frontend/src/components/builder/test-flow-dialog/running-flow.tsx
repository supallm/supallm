import { FlowNode } from "@/core/entities/flow";
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
import { NodeType } from "../node-types";
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
    const key = `${edge.source}->${edge.target}`;
    if (!seen.has(key)) {
      seen.add(key);
      dedupedEdges.push(edge);
      dagreGraph.setEdge(edge.target, edge.source);
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
    layoutGraphWithStandardHandles(initialNodes, initialEdges, "TB");

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
  const nodeTypes: Record<NodeType, any> = useMemo(
    () => ({
      "chat-openai": RunningFlowNode,
      result: RunningFlowNode,
      entrypoint: RunningFlowNode,
      "code-executor": RunningFlowNode,
      "e2b-interpreter": RunningFlowNode,
      "http-request": RunningFlowNode,
      "chat-anthropic": RunningFlowNode,
      "chat-google": RunningFlowNode,
      "chat-azure": RunningFlowNode,
      "chat-mistral": RunningFlowNode,
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
