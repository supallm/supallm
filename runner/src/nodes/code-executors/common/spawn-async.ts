import { ChildProcessWithoutNullStreams } from "child_process";

export async function spawnProcessAsync(
  spawnFunction: () => ChildProcessWithoutNullStreams,
  onLog: (str: string) => void,
  onError: (str: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawnFunction();

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout.on("data", (data) => {
      const chunk = data.toString();
      stdoutBuffer += chunk;

      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() ?? "";

      for (const line of lines) {       
        onLog(line);
      }
    });

    child.stderr.on("data", (data) => {
      const chunk = data.toString();
      stderrBuffer += chunk;

      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() ?? "";

      for (const line of lines) {
        onLog(line);
      }
    });

    child.on("error", (err) => onError(err.message));

    child.on("close", (code) => {
      if (code ?? 0 > 0) {
        reject(
          new Error(`Process exited with code ${code}.`),
        );
      } else {
        resolve();
      }
    });
  });
}


export async function spawnWrappedFunctionProcessAsync(
  spawnFunction: () => ChildProcessWithoutNullStreams,
  onLog: (str: string) => void,
  onError: (str: string) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawnFunction();

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout.on("data", (data) => {
      const chunk = data.toString();
      stdoutBuffer += chunk;

      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("__FUNCTION_RESULT__")) {
          return resolve(line.replace("__FUNCTION_RESULT__", "").trim());
        }
        onLog(line);
      }
    });

    child.stderr.on("data", (data) => {
      const chunk = data.toString();
      stderrBuffer += chunk;

      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() ?? "";

      for (const line of lines) {
        onLog(line);
      }
    });

    child.on("error", (err) => onError(err.message));

    child.on("close", (code) => {
      if (stdoutBuffer.startsWith("__FUNCTION_RESULT__")) {
        return resolve(stdoutBuffer.replace("__FUNCTION_RESULT__", "").trim());
      }
      reject(
        new Error(`Process exited with code ${code} and no function result`),
      );
    });
  });
}
