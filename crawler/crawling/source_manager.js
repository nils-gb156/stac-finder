/**
 * @file source_manager.js
 * @description Manages the crawlable STAC sources URLs and the dynamic crawling queue.
 */
const db = require('../data/db_client');
const logger = require('../config/logger');

let urlQueue = [];

/**
 * Adds a URL to the queue if not already present.
 * @param {string} url
 * @function addToQueue
 */
function addToQueue(url) {
    if (!url || typeof url !== "string") return;

    try {
        new URL(url); // validate URL format
    } catch {
        logger.warn(`Skipped invalid URL added to queue: ${url}`);
        return;
    }

    if (!urlQueue.includes(url)) {
        urlQueue.push(url);
        logger.info(`Added to queue: ${url}`);
    }
}

/**
 * Retrieves the next URL in FIFO order.
 * @returns {string|null}
 * @function getNextUrl
 */
function getNextUrl() {
    return urlQueue.length > 0 ? urlQueue.shift() : null;
}

/**
 * Returns true if URLs remain in the queue.
 * @returns {boolean}
 * @funtion hasNextUrl
 */
function hasNextUrl() {
    return urlQueue.length > 0;
}

/**
 * Clears the current queue (e.g. at start of crawler run).
 * @function clearQueue
 */
function clearQueue() {
    urlQueue = [];
    logger.info("Queue cleared.");
}
/**
 * Load all STAC sources from the database.
 * 
 * @async
 * @function loadSources
 * @returns {Promise<Array<Object>>} List of source objects with normalized fields.
 */
async function loadSources() {
    try {
        const result = await db.query(`
            SELECT
                id,
                title,
                url,
                type,
                last_crawled_timestamp
            FROM stac.sources;
        `);

        logger.info(`Loaded ${result.rows.length} sources from database.`);
        return result.rows;

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
async function getSource(id) {
    try {
        const result = await db.query(
            `SELECT * FROM stac.sources WHERE id = $1 LIMIT 1;`,
            [id]
        );

        return result.rows[0] || null;
    } catch (error) {
        logger.error(`Error loading source ${id}: ${error.message}`);
        throw error;
    }
}

/**
 * Mark a source as successfully crawled by updating its timestamp.
 * 
 * @async
 * @function markSourceCrawled
 * @param {number} id - The source ID to update.
 * @returns {Promise<void>}
 */
async function markSourceCrawled(id) {
    try {
        await db.query(
            `UPDATE stac.sources
             SET last_crawled_timestamp = NOW()
             WHERE id = $1;`,
            [id]
        );

        logger.info(`Marked source ${id} as crawled.`);

    } catch (error) {
        logger.error(`Failed to update source ${id}: ` + error.message);
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
async function loadActiveSources() {
    const sources = await loadSources();

    return sources.filter(validateSource);
}

/**
 * Load sources that have never been crawled.
 *
 * @async
 * @function loadUncrawledSources
 * @returns {Promise<Array<Object>>} Sources whose lastCrawled field is null.
 */
async function loadUncrawledSources() {
  const sources = await loadSources();
  return sources.filter(src => !src.last_crawled_timestamp);
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
function validateSource(source) {
    if (!source.url) return false;
    if (!source.type) return false;

    try {
        new URL(source.url); // throws on invalid URLs
    } catch {
        return false;
    }

    return true;
}

/**
 * Initializes the queue by loading DB sources.
 */
async function intitializeQueue() {
    clearQueue();
    const sources = await loadActiveSources();
    for (const src of sources) {
        addToQueue(src.url);
    }
    logger.info(`Queue initialized with ${urlQueue.length} URLs.`);
}

module.exports = {
    addToQueue,
    getNextUrl,
    hasNextUrl,
    clearQueue,
    loadSources,
    getSource,
    markSourceCrawled,
    loadActiveSources,
    loadUncrawledSources,
    validateSource,
    initializeQueue
};