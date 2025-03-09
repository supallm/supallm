export type ResultHandle = {
  label: string;
  type: "text" | "image";
  id: string;
};

export type ResultNodeData = {
  handles: ResultHandle[];
};
