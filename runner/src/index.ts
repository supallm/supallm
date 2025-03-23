import { RunnerServer } from "./server";
import config from "./utils/config";
import { logger } from "./utils/logger";
async function main() {
  try {
    const server = new RunnerServer(config);

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
