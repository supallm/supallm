import dotenv from "dotenv";
import { RunnerServer } from "./server";
import { logger } from "./utils/logger";
dotenv.config();

async function main() {
  try {
    const redisUrl = `redis://${process.env["REDIS_HOST"]}:${process.env["REDIS_PORT"]}`;
    const server = new RunnerServer({ redisUrl });

    process.on("SIGINT", async () => {
      logger.info("received SIGINT. Shutting down...");
      await server.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("received SIGTERM. Shutting down...");
      await server.stop();
      process.exit(0);
    });

    await server.start();
  } catch (error) {
    logger.error(`failed to start server: ${error}`);
    process.exit(1);
  }
}

main();
