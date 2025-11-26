/**
 * @file prisma.js
 * @description Initializes and exports a singleton PrismaClient instance for database access.
 */

import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient instance used throughout the crawler.
 * Ensures a single shared database connection.
 * 
 * @type {PrismaClient}
 */
export const prisma = new PrismaClient();