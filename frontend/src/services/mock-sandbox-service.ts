import { SandboxService } from "@/core/interfaces";

export class MockSandboxService implements SandboxService {
  constructor() {}

  async runCode(data: {
    code: string;
    language: "typescript";
    args: unknown[];
    onLog: (log: string) => void;
    onResult: (result: string) => void;
    onError: (error: string) => void;
  }) {
    const { code, language, args, onLog, onResult, onError } = data;

    try {
      onLog("Starting code execution with args: " + args.join(", "));

      // Simulate code execution with logs
      onLog("Compiling TypeScript code...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onLog("Executing code...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate result
      const simulatedResult = "Execution result: 42";
      onResult(simulatedResult);

      onLog("Code execution completed successfully.");
    } catch (e: any) {
      onError(`Error during code execution: ${e.message}`);
    }
  }
}
