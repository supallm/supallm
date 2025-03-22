export function serializeArg(arg: any): string {
  if (typeof arg === "function") {
    return `eval(${JSON.stringify(arg.toString())})`;
  }

  return JSON.stringify(arg);
}
