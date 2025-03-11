import { RunnerServer } from "./server";
import { logger } from "./utils/logger";

async function main() {
  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379/0";
    const server = new RunnerServer(redisUrl);

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT. Shutting down...");
      await server.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM. Shutting down...");
      await server.stop();
      process.exit(0);
    });

    // Start the server
    await server.start();
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

main();
