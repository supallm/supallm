import {
  ErrorType,
  RunnerError,
  isRunnerError,
  createError,
} from "./error-types";
import { logger } from "../utils/logger";

/**
 * ErrorHandler provides centralized error handling for the entire runner application
 */
export class ErrorHandler {
  /**
   * maps any error to a standardized RunnerError based on patterns
   */
  static mapError(error: unknown): RunnerError {
    if (isRunnerError(error)) {
      return error;
    }

    // extract details for logging purposes
    const details: Record<string, unknown> = {};

    if (error instanceof Error) {
      details["name"] = error.name;
      details["stack"] = error.stack;
    }

    if (typeof error === "object" && error !== null && "code" in error) {
      const errorCode = String(error.code);

      if (errorCode === "ECONNREFUSED" || errorCode === "ENOTFOUND") {
        return createError(
          ErrorType.CONNECTION_FAILED,
          "failed to connect to the service",
          details
        );
      }

      if (errorCode === "ETIMEDOUT") {
        return createError(ErrorType.TIMEOUT, "connection timed out", details);
      }
    }

    // map HTTP status-based errors
    if (typeof error === "object" && error !== null && "status" in error) {
      const status = Number(error.status);

      if (status === 401 || status === 403) {
        return createError(
          ErrorType.AUTHENTICATION_FAILED,
          "authentication failed or access denied",
          details
        );
      }

      if (status === 400) {
        return createError(
          ErrorType.INVALID_PARAMETER,
          "invalid request parameters",
          details
        );
      }

      if (status === 404) {
        return createError(
          ErrorType.PROVIDER_UNAVAILABLE,
          "requested resource not found",
          details
        );
      }

      if (status >= 500) {
        return createError(
          ErrorType.PROVIDER_REJECTED,
          "provider service error",
          details
        );
      }
    }

    // Handle message pattern matching as fallback
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("auth") ||
        message.includes("unauthorized") ||
        message.includes("permission")
      ) {
        return createError(
          ErrorType.AUTHENTICATION_FAILED,
          "authentication failed",
          details
        );
      }

      if (
        message.includes("invalid") ||
        message.includes("required") ||
        message.includes("missing")
      ) {
        return createError(
          ErrorType.INVALID_PARAMETER,
          "invalid or missing parameter",
          details
        );
      }

      if (message.includes("timeout") || message.includes("timed out")) {
        return createError(ErrorType.TIMEOUT, "operation timed out", details);
      }
    }

    // default internal error
    return createError(
      ErrorType.INTERNAL_ERROR,
      "an unexpected error occurred",
      details
    );
  }

  /**
   * logs an error with standardized format and appropriate level
   */
  static logError(context: string, error: RunnerError): void {
    const category = error.type.category;
    const message = `[${context}] ${error.type.code}: ${error.message}`;

    switch (category) {
      case "VALIDATION":
      case "NETWORK":
        // less severe errors
        logger.warn(message, { error });
        break;
      case "PROVIDER":
        // provider errors could be external or internal
        if (error.type === ErrorType.PROVIDER_REJECTED) {
          logger.warn(message, { error });
        } else {
          logger.error(message, { error });
        }
        break;
      default:
        // security and system errors are most severe
        logger.error(message, { error });
    }
  }

  /**
   * handles an error by mapping, logging, and potentially taking additional actions
   */
  static handleError(context: string, error: unknown): RunnerError {
    const mappedError = this.mapError(error);
    this.logError(context, mappedError);
    return mappedError;
  }
}
