export type ResultHandle = {
  label: string;
  type: "text" | "image" | "text-stream";
  id: string;
};

export type ResultNodeData = {
  handles: ResultHandle[];
};
