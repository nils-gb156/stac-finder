/**
 * @file logger.js
 * @description Configures and exports a Winston logger instance for structured logging.
 */

const winston = require("winston");

/**
 * Winston logger instance used by all crawler modules.
 * Logs include timestamps and are printed in human-readable format.
 * 
 * @type {import("winston").Logger}
 */
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

module.exports = logger;