/**
 * @file source_manager.js
 * @description Provides functions to load, validate, filter and update STAC source records 
 *              stored in the database. The Source Manager is the entry point for determining
 *              which URLs the crawler should process.
 */
import { prisma } from "../data/prisma.js";
import { logger } from "../config/logger.js";

/**
 * Load all STAC sources from the database.
 * 
 * @async
 * @function loadSources
 * @returns {Promise<Array<Object>>} List of source objects with normalized fields.
 */
export async function loadSources() {
    try {
        const sources = await prisma.source.findMany();

        logger.info(`Loaded ${sources.length} sources from database.`);

        return sources.map(src => ({
            id: src.id,
            title: src.title,
            url: src.url,
            type: src.type,
            metadata: src.metadata ?? {},
            lastCrawled: src.last_crawled_timestamp
        }));

    } catch (error) {
        logger.error("Error loading sources: " + error.message);
        throw error;
    }
}

/**
 * Retrieve a single source record by ID.
 * 
 * @async
 * @function getSource
 * @param {number} id - The ID of the source to load.
 * @returns {Promised<Object|null>} The source record or null if not found.
 */
export async function getSource(id) {
    return prisma.source.findUnique({ where: { id } });
}

/**
 * Mark a source as successfully crawled by updating its timestamp.
 * 
 * @async
 * @function markSourceCrawled
 * @param {number} id - The source ID to update.
 * @returns {Promise<void>}
 */
export async function markSourceCrawled(id) {
    try {
        await prisma.source.update({
            where: { id },
            data: {
                last_crawled_timestamp: new Date()
            }
        });
        logger.info(`Marked source ${id} as crawled.`);
    } catch (error) {
        logger.error("Failed to update source ${id}: " + error.message);
        throw error;
    }
    
}

/**
 * Load only sources that appear valid (URL + type present).
 * 
 * @async
 * @function loadActiveSources
 * @returns {Promise<Array<Object>>} Filtered sources that are crawlable.
 */
export async function loadActiveSources() {
    const sources = await loadSources();

    return sources.filter(src => src.url && src.type);
}

/**
 * Load sources that have never been crawled.
 *
 * @async
 * @function loadUncrawledSources
 * @returns {Promise<Array<Object>>} Sources whose lastCrawled field is null.
 */
export async function loadUncrawledSources() {
  const sources = await loadSources();
  return sources.filter(src => !src.lastCrawled);
}

/**
 * Validate whether a source record contains a valid URL + type.
 *
 * @function validateSource
 * @param {Object} source - Source object.
 * @param {string} source.url - The URL to validate.
 * @param {string} source.type - The crawler-type of the source.
 * @returns {boolean} True if valid, otherwise false.
 */
export function validateSource(source) {
    if (!source.url) return false;
    if (!source.type) return false;

    try {
        new URL(source.url); // throws on invalid URLs
    } catch {
        return false;
    }

    return true;
}