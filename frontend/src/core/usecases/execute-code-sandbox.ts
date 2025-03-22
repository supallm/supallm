import { SandboxService } from "../interfaces";

export class ExecuteCodeSandboxUsecase {
  constructor(private readonly service: SandboxService) {}

  async execute(req: {
    code: string;
    language: "typescript";
    projectId: string;
    inputs: Record<string, unknown>;
    onLog: (log: string) => void;
    onResult: (result: string) => void;
    onError: (error: string) => void;
  }): Promise<void> {
    await this.service.runCode({
      code: req.code,
      language: req.language,
      projectId: req.projectId,
      args: Object.values(req.inputs),
      onLog: req.onLog,
      onResult: req.onResult,
      onError: req.onError,
    });
  }
}
