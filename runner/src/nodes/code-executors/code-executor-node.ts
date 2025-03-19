import { execSync } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { assertUnreachable } from "../../utils/type-safety";
import {
  parseCodeForRequiredModules,
  validateMainFunctionExists,
} from "../../utils/typescript-utils";

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
          return this.runTypeScript(code, arguments);
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
        main();
  })()
  `;
  }

  private isScriptValid(code: string) {
    return validateMainFunctionExists(code);
  }

  runTypeScript(
    code: string,
    args: Arguments,
  ): {
    stdout: string;
    stderr: string;
    exitCode: number;
  } {
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

    // 2. Write the TypeScript file inside the unique sandbox
    const tsFilePath = path.join(sandboxPath, "script.ts");
    fs.writeFileSync(tsFilePath, callableScript);

    const tsConfigFilePath = path.join(sandboxPath, "tsconfig.json");
    const tsConfig = fs.readFileSync(TS_CONFIG, "utf8");
    console.log("**** TS CONFIG ***", tsConfig);
    console.log("**** TS CONFIG FILE PATH ***", tsConfigFilePath);
    fs.writeFileSync(tsConfigFilePath, tsConfig);

    // 3. Generate a temporary `.proto` file with the sandbox ID
    const protoFilePath = path.join(sandboxPath, "sandbox.proto");
    const protoTemplate = fs.readFileSync(NSJAIL_TEMPLATE, "utf8");
    const protoContent = protoTemplate.replace(/{SANDBOX_ID}/g, sandboxId);
    fs.writeFileSync(protoFilePath, protoContent);

    try {
      // 4. Compile TypeScript inside `nsjail`
      const compileResult = execSync(
        `${NSJAIL_PATH} --config ${protoFilePath} -- /bin/sh -c "cd sandbox && ls -la && tsc --project tsconfig.json && tsc --showConfig script.ts"`,
        { cwd: sandboxPath, stdio: "inherit" },
      );

      console.log("**** COMPILED ***");

      // 5. Execute the compiled JavaScript file inside `nsjail`
      const result = execSync(
        `${NSJAIL_PATH} --config ${protoFilePath} -- /bin/node sandbox/dist/script.js`,
        { cwd: sandboxPath, encoding: "utf8" },
      );

      console.log("**** EXECUTED ***");
      console.log(result);

      return { stdout: result, stderr: "", exitCode: 0 };
    } catch (error: any) {
      return { stdout: "", stderr: error.message, exitCode: error.status ?? 1 };
    } finally {
      // 6. Cleanup: Remove the sandbox folder and temporary `.proto` file
      fs.rmSync(sandboxPath, { recursive: true, force: true });
    }
  }
}

const codeExecutorNode = new CodeExecutorNode();

codeExecutorNode.execute(
  "function main() { console.log('Hello, world!'); }",
  "typescript",
  {},
);
