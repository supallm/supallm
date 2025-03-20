import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Define log level based on environment
const level = () => {
  const env = process.env["NODE_ENV"] || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : process.env["LOG_LEVEL"] || "info";
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info["timestamp"]} ${info["level"]}: ${info["message"]}`
  )
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

if (process.env["NODE_ENV"] !== "production") {
  logger.debug("logging initialized at debug level");
}

logger.info(`
██████╗ ██╗   ██╗███╗   ██╗███╗   ██╗███████╗██████╗ 
██╔══██╗██║   ██║████╗  ██║████╗  ██║██╔════╝██╔══██╗
██████╔╝██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝
██╔══██╗██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗
██║  ██║╚██████╔╝██║ ╚████║██║ ╚████║███████╗██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝  
`);
