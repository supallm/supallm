// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertUnreachable = (x: never): never => {
  throw new Error(
    "Unreachable code. If you see this, it means your type is not exhaustive.",
  );
};
