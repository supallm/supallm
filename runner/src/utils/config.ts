import dotenv from "dotenv";
dotenv.config();

export interface RunnerConfig {
  nodeEnv: "development" | "production" | "test";
  maxConcurrentJobs: number;
  redisUrl: string;
  secretKey: string;
  nsJailCloneNewUser: "true" | "false";
  disableNsJail: boolean;
}

const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getStringEnv = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const getBoolEnv = (key: string, defaultValue: boolean): boolean => {
  return process.env[key] === "true" || defaultValue;
};

const getKey = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set`);
  }
  return value;
};

const getRedisUrl = (): string => {
  return `redis://${getKey("REDIS_HOST")}:${getKey("REDIS_PORT")}`;
};

export const config: RunnerConfig = {
  nodeEnv: getStringEnv("NODE_ENV", "development") as RunnerConfig["nodeEnv"],
  maxConcurrentJobs: getNumberEnv("RUNNER_MAX_CONCURRENT_JOBS", 5),
  redisUrl: getRedisUrl(),
  secretKey: getKey("SECRET_KEY"),
  nsJailCloneNewUser:
    getStringEnv("NSJAIL_CLONE_NEW_USER", "true") !== "true" ? "false" : "true",
  disableNsJail: getBoolEnv("DISABLE_NSJAIL", false),
};

export function validateConfig(config: RunnerConfig): void {
  if (config.maxConcurrentJobs <= 0) {
    throw new Error("maxConcurrentJobs must be a positive number");
  }
}

validateConfig(config);
export default config;
