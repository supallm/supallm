import { RunnerServer } from "./server";
import { logger } from "./utils/logger";

async function main() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 50051;
    const server = new RunnerServer(port);

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
