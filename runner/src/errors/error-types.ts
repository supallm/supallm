/**
 * base error categories
 */
export const ErrorCategory = {
  VALIDATION: "VALIDATION",
  PROVIDER: "PROVIDER",
  NETWORK: "NETWORK",
  SECURITY: "SECURITY",
  SYSTEM: "SYSTEM",
} as const;

export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];

/**
 * sub-types within each category
 */
export const ErrorType = {
  MISSING_PARAMETER: {
    category: ErrorCategory.VALIDATION,
    code: "MISSING_PARAMETER",
  },
  INVALID_PARAMETER: {
    category: ErrorCategory.VALIDATION,
    code: "INVALID_PARAMETER",
  },
  INVALID_FORMAT: {
    category: ErrorCategory.VALIDATION,
    code: "INVALID_FORMAT",
  },

  PROVIDER_UNAVAILABLE: {
    category: ErrorCategory.PROVIDER,
    code: "PROVIDER_UNAVAILABLE",
  },
  PROVIDER_REJECTED: {
    category: ErrorCategory.PROVIDER,
    code: "PROVIDER_REJECTED",
  },
  MODEL_UNAVAILABLE: {
    category: ErrorCategory.PROVIDER,
    code: "MODEL_UNAVAILABLE",
  },

  CONNECTION_FAILED: {
    category: ErrorCategory.NETWORK,
    code: "CONNECTION_FAILED",
  },
  TIMEOUT: { category: ErrorCategory.NETWORK, code: "TIMEOUT" },

  AUTHENTICATION_FAILED: {
    category: ErrorCategory.SECURITY,
    code: "AUTHENTICATION_FAILED",
  },
  PERMISSION_DENIED: {
    category: ErrorCategory.SECURITY,
    code: "PERMISSION_DENIED",
  },

  INTERNAL_ERROR: { category: ErrorCategory.SYSTEM, code: "INTERNAL_ERROR" },
  UNEXPECTED_STATE: {
    category: ErrorCategory.SYSTEM,
    code: "UNEXPECTED_STATE",
  },
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/**
 * standard error interface for the entire runner
 */
export interface RunnerError {
  type: ErrorType;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * function to create a typed error without exposing implementation details
 */
export function createError(
  type: ErrorType,
  message: string,
  details?: Record<string, unknown>
): RunnerError {
  return {
    type,
    message,
    details: details ? filterSensitiveInfo(details) : undefined,
  };
}

/**
 * removes potentially sensitive information from error details
 */
function filterSensitiveInfo(
  details: Record<string, unknown>
): Record<string, unknown> {
  const filtered = { ...details };

  // remove sensitive fields
  const sensitiveFields = ["apiKey", "password", "token", "secret"];
  sensitiveFields.forEach((field) => {
    if (field in filtered) {
      delete filtered[field];
    }
  });

  return filtered;
}

/**
 * type guard to check if an error is a RunnerError
 */
export function isRunnerError(error: unknown): error is RunnerError {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "message" in error &&
    typeof (error as RunnerError).message === "string"
  );
}

/**
 * helper to create result types that can contain success or error
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: RunnerError };
