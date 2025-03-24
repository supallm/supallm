import { spawn } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Result } from "typescript-result";
import {
  parseCodeForRequiredModules,
  validateMainFunctionExists,
} from "../../../utils/typescript-utils";
import { serializeArg } from "../common/serialize-arg";
import {
  spawnProcessAsync,
  spawnWrappedFunctionProcessAsync,
} from "../common/spawn-async";
import {
  CodeExecutionError,
  MainFunctionMissingError,
  NodejsExecutorError,
  NpmInstallError,
  ParseResultError,
  ScriptValidationError,
  TypeScriptCompilationError,
} from "./executor.errors";

export type Argument = {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "any";
  value: string;
};

const NSJAIL_PATH = "/usr/local/bin/nsjail";

// Caution: this may change depending on the distribution used
const NPM_PATH = "/bin/npm";

const NSJAIL_TEMPLATE = path.join(__dirname, "nsjail.nodejs.proto");

const SANDBOX_ROOT = "/tmp/nsjail";

const TS_CONFIG = path.join(__dirname, "executor.ts-config.json");

export class NodejsExecutor {
  private wrapMainFunctionIntoCallable(code: string, args: Argument[]) {
    const argString = args.map((arg) => serializeArg(arg.value)).join(", ");

    return `
        ${code}
    
        (async () => {
            const result = await Promise.resolve(main(${argString}))
            console.log('__FUNCTION_RESULT__', JSON.stringify(result))
      })()
      `;
  }

  private validateScript(code: string): Result<void, ScriptValidationError> {
    const mainFunctionExists = validateMainFunctionExists(code);

    if (!mainFunctionExists) {
      return Result.error(new MainFunctionMissingError());
    }

    return Result.ok();
  }

  async runTypeScript(
    code: string,
    args: Argument[],
    onLog: (data: string) => void,
    onError: (data: string) => void,
  ): Promise<Result<Record<string, any>, NodejsExecutorError>> {
    const validateScript = this.validateScript(code);

    if (validateScript.isError()) {
      return Result.error(validateScript.error);
    }

    const callableScript = this.wrapMainFunctionIntoCallable(code, args);

    console.log("CALLABLE SCRIPT", callableScript);
    const modulesToInstall = [
      ...parseCodeForRequiredModules(callableScript),
      "@types/node",
    ];

    // 1. Generate a unique sandbox ID
    const sandboxId = crypto.randomBytes(4).toString("hex");
    const sandboxPath = path.join(SANDBOX_ROOT, sandboxId);
    fs.mkdirSync(sandboxPath, { recursive: true });
    console.log("Created directory:", sandboxPath);

    // 2. Write the TypeScript file inside the unique sandbox
    const tsFilePath = path.join(sandboxPath, "script.ts");
    fs.writeFileSync(tsFilePath, callableScript);
    console.log("Wrote script to:", tsFilePath);

    const tsConfigFilePath = path.join(sandboxPath, "tsconfig.json");
    const tsConfig = fs.readFileSync(TS_CONFIG, "utf8");
    fs.writeFileSync(tsConfigFilePath, tsConfig);
    console.log("Wrote tsconfig to:", tsConfigFilePath);

    // 3. Generate a temporary `.proto` file with the sandbox ID
    const protoFilePath = path.join(sandboxPath, "sandbox.proto");
    const protoTemplate = fs.readFileSync(NSJAIL_TEMPLATE, "utf8");
    const protoContent = protoTemplate.replace(/{SANDBOX_ID}/g, sandboxId);
    fs.writeFileSync(protoFilePath, protoContent);
    console.log("Wrote njail proto to:", protoFilePath);

    const cleanSandbox = () => {
      fs.rmSync(sandboxPath, { recursive: true, force: true });
    };

    console.log("New version.");

    if (modulesToInstall.length > 0) {
      try {
        onLog(`Installing dependencies...`);
        const npmiSpawnFunc = () => {
          return spawn(
            NSJAIL_PATH,
            [
              "--config",
              protoFilePath,
              "--",
              NPM_PATH,
              "cache",
              "clean",
              "--force",
              "--loglevel=verbose",
              "&&",
              NPM_PATH,
              "install",
              modulesToInstall.join(" "),
              "--loglevel=verbose",
            ],
            { cwd: sandboxPath, shell: true },
          );
        };

        await spawnProcessAsync(npmiSpawnFunc, onLog, onError);

        onLog(`Dependencies installed successfully`);
      } catch (error: any) {
        onError(`Dependencies installation failed: ${error.message}`);
        cleanSandbox();
        return Result.error(new NpmInstallError(error.message));
      }
    }

    try {
      onLog(`Compiling TypeScript...`);
      const ccSpawnFunc = () => {
        return spawn(
          NSJAIL_PATH,
          [
            "--config",
            protoFilePath,
            "--",
            "/bin/sh",
            "-c",
            '"cd sandbox && ls -la && cat script.ts && tsc --project tsconfig.json && tsc --showConfig script.ts"',
          ],
          { cwd: sandboxPath, shell: true },
        );
      };

      await spawnProcessAsync(ccSpawnFunc, onLog, onError);

      onLog(`TypeScript compiled successfully`);
    } catch (error: any) {
      onError(`TypeScript compilation failed: ${error.message}`);
      cleanSandbox();
      return Result.error(new TypeScriptCompilationError(error.message));
    }

    let result: string = "";
    try {
      const spawnFunc = () =>
        spawn(
          NSJAIL_PATH,
          [
            "--config",
            protoFilePath,
            "--",
            "/bin/node",
            "sandbox/dist/script.js",
          ],
          {
            shell: true,
            cwd: sandboxPath,
          },
        );

      result = await spawnWrappedFunctionProcessAsync(
        spawnFunc,
        onLog,
        onError,
      );
    } catch (error: any) {
      onError(`Execution failed: ${error.message}`);
      cleanSandbox();
      return Result.error(new CodeExecutionError(error.message));
    }

    try {
      const parseResult = JSON.parse(result);

      cleanSandbox();
      return Result.ok(parseResult);
    } catch (error: any) {
      cleanSandbox();
      return Result.error(new ParseResultError(error.message));
    }
  }
}
