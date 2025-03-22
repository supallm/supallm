import { Result } from "typescript-result";

export class ModelNotFoundError extends Error {
  readonly type = "model-not-found-error";
}

export class ProviderNotSupportedError extends Error {
  readonly type = "provider-not-supported-error";
}

export class MissingAPIKeyError extends Error {
  readonly type = "missing-api-key-error";
}

export class InvalidInputError extends Error {
  readonly type = "invalid-input-error";
}
export class InvalidOutputError extends Error {
  readonly type = "invalid-output-error";
}

export class ProviderAPIError extends Error {
  readonly type = "provider-api-error";
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class TokenLimitExceededError extends Error {
  readonly type = "token-limit-exceeded-error";
}

export class MessageFormatError extends Error {
  readonly type = "message-format-error";
}

export type LLMProviderError =
  | ModelNotFoundError
  | ProviderNotSupportedError
  | MissingAPIKeyError
  | ProviderAPIError;

export type LLMExecutionError =
  | LLMProviderError
  | TokenLimitExceededError
  | MessageFormatError
  | InvalidInputError
  | InvalidOutputError;

// Type alias to simplify function signatures
export type LLMResult<T> = Result<T, LLMExecutionError>;
