import { execSync, spawn } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { assertUnreachable } from "../../utils/type-safety";
import {
  parseCodeForRequiredModules,
  validateMainFunctionExists,
} from "../../utils/typescript-utils";
import { spawnProcessAsync } from "./spawn-async";

type Arguments = Record<string, any>;

interface CodeExecutorNodeInputs {
  code: string;
  language: "typescript";
  arguments: Arguments;
}

const NSJAIL_PATH = "/usr/local/bin/nsjail";

const NSJAIL_TEMPLATE = path.join(
  __dirname,
  "nsjail",
  "run.typescript-nodejs.proto",
);
const SANDBOX_ROOT = "/tmp/nsjail";

const TS_CONFIG = path.join(__dirname, "executor.ts-config.json");

export class CodeExecutorNode {
  async execute(
    code: string,
    language: "typescript",
    args: Arguments,
  ): Promise<any> {
    try {
      switch (language) {
        case "typescript":
          const res = await this.runTypeScript(
            code,
            arguments,
            (data) => {
              console.log("STDOUT", data);
            },
            (data) => {
              console.log("STDERR", data);
            },
          );

          console.log("FINAL RESULT=>", res);
          return res;
        default:
          assertUnreachable(language);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private wrapMainFunctionIntoCallable(code: string, args: Arguments) {
    return `
    ${code}

    (async () => {
        const result = await Promise.resolve(main())
        console.log('__FUNCTION_RESULT__', JSON.stringify(result))
  })()
  `;
  }

  private isScriptValid(code: string) {
    return validateMainFunctionExists(code);
  }

  async runTypeScript(
    code: string,
    args: Arguments,
    onStdout: (data: string) => void,
    onStderr: (data: string) => void,
  ) {
    const validateScript = this.isScriptValid(code);

    if (!validateScript) {
      throw new Error("Main function not found in script");
    }

    const callableScript = this.wrapMainFunctionIntoCallable(code, args);
    const modulesToInstall = parseCodeForRequiredModules(callableScript);

    console.log("Callable script:", callableScript);

    console.log("Modules to install:", modulesToInstall);
    // TODO: Install the modules
    // if (modulesToInstall.length > 0) {
    //   execSync(`npm install ${modulesToInstall.join(" ")}`, {
    //     cwd: SANDBOX_ROOT,
    //   });
    // }

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

    try {
      const compileResult = execSync(
        `${NSJAIL_PATH} --config ${protoFilePath} -- /bin/sh -c "cd sandbox && ls -la && tsc --project tsconfig.json && tsc --showConfig script.ts"`,
        { cwd: sandboxPath, encoding: "utf8" },
      );

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

      const result = await spawnProcessAsync(spawnFunc, onStdout, onStderr);

      // TODO: handle the case where the result is not parseable. How to do it?
      return JSON.parse(result);
    } catch (error: any) {
      return { stdout: "", stderr: error.message, exitCode: error.status ?? 1 };
    } finally {
      //   // 6. Cleanup: Remove the sandbox folder and temporary `.proto` file
      //   fs.rmSync(sandboxPath, { recursive: true, force: true });
    }
  }
}

const codeExecutorNode = new CodeExecutorNode();

codeExecutorNode.execute(
  `function main() {
    let i = 0;
    while (i < 5) {
        console.log("Hello, world!", i);
        i++;
    }

    return { coucou: true }
  }`,
  "typescript",
  {},
);
