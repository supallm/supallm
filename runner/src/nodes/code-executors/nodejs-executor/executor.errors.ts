export class MainFunctionMissingError extends Error {
  readonly type = "main-function-missing-error";
}

export class TypeScriptCompilationError extends Error {
  readonly type = "typescript-compilation-error";
}

export class NpmInstallError extends Error {
  readonly type = "npm-install-error";
}

export class ExpectedRecordReturnError extends Error {
  readonly type = "expected-record-return-error";
}

export class CodeExecutionError extends Error {
  readonly type = "code-execution-error";
}

export class ParseResultError extends Error {
  readonly type = "parse-result-error";
}

export type ScriptValidationError =
  | MainFunctionMissingError
  | TypeScriptCompilationError
  | ExpectedRecordReturnError;

export type NodejsExecutorError =
  | ScriptValidationError
  | NpmInstallError
  | TypeScriptCompilationError
  | ExpectedRecordReturnError
  | CodeExecutionError
  | ParseResultError;
