export type EntrypointHandle = {
  label: string;
  type: "text" | "image";
  id: string;
};

export type EntrypointNodeData = {
  handles: EntrypointHandle[];
};
