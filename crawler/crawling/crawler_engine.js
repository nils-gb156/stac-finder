//imports 
import {
    initializeQueue,
    getNextUrlFromDB,
    hasNextUrl,
    removeFromQueue,
    addToQueue
} from "./queue_manager.js";
import { handleSTACObject } from "./crawler_functions.js"
import { validateStacObject } from "../parsing/json_validator.js";
import { logger } from "./src/config/logger.js"
import { getSTACIndexData } from "../data_management/stac_index_client.js";

const CRAWL_DELAY_MS = 1000; // Polite delay
const MAX_RETRIES = 3;       // Max attempts
const RETRY_DELAY_MS = 2000; // Base backoff time

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry-aware fetch:
 * - retries: Network errors, 5xx Server Errors, and 429 (Rate Limit) with linear backoff.
 * - aborts fast on fatal 4xx (except 429)
 * - returns parsed JSON on success
 */
async function fetchWithRetry(url, maxRetries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.info(`Fetching ${url} (attempt ${attempt}/${maxRetries})`);
            const response = await fetch(url);
            const status = response.status;
            if (response.ok) return await response.json();
            if (status >= 400 && status < 500 && status !== 429) {
                throw new Error(`Fatal Client Error ${status}: ${response.statusText} - Will not retry.`);
            }
            throw new Error(`Request failed with status ${status}: ${response.statusText}`);
        } catch (error) {
            if (error.message.includes("Fatal Client Error")) throw error;
            logger.warn(`Attempt ${attempt} failed for ${url}: ${error.message}`);
            if (attempt === maxRetries) throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
            const delay = RETRY_DELAY_MS * attempt;
            logger.info(`Waiting ${delay}ms before next retry...`);
            await sleep(delay);
        }
    }
}

/**
* Main crawler loop:
* - initializes queue from DB (unrcrawled sources)
* - repeatedly fetches next URLs
* - adds new URLs back into queue
* - removes processed URL
*
* This function implements the core recursive traversal described in the Pflichtenheft.
*
* @async
* @function startCrawler
* @returns {Promise<void>} Completes when no URLs remain in the queue
*/
export async function startCrawler() {

    console.log("Crawler started");

    // Initialize queue from database
    await initializeQueue();

    // Load URLs from STAC Index (fail-safe)
    try {
        const STACIndexData = await getSTACIndexData();
        for (let data of STACIndexData) {
            await addToQueue(data.title, data.url);
        }
    } catch (err) {
        logger.error("Could not load STAC Index data, starting with existing queue only.");
    }

    // Continue crawling until no URLs remain in queue
    while (await hasNextUrl()) {

        // Fetch next URL entry from queue table
            const entry = await getNextUrlFromDB();
            const url = entry.url_of_source;
            const parentUrl = entry.parent_url ?? null;

        try {
            //get the json from the url
            const res = await fetch(url)
            const STACObject = await res.json()

            console.log(`Crawling: ${url}`);
            
            // Only proceed if valid JSON was retrieved
            if (validateStacObject(STACObject).valid) {

                //for Catalogs: put the child urls into the queue
                //for Collections: put the child urls into the queue, save the data in the sources/collections db
                await handleSTACObject(STACObject, url, parentUrl)
        
                } else {
                    logger.warn("Warning: Invalid STAC object")
                }
            
        } catch(err) {
            logger.warn(`Warning: Did not crawled the following url: ${url} because of the following error: ${err}`)
        }
        
        // Remove processed URL from queue to avoid re-processing
        await removeFromQueue(url);
    }

    console.log("Crawling finished");
}

/**
* Continue crawler-loop:
* continues crawling if the crawling process stopped because of a network failiure
* - repeatedly fetches the URLs that are already in the queue
* - adds new URLs into queue
* - removes processed URL
*
* This function implements the core recursive traversal described in the Pflichtenheft.
*
* @async
* @function continueCrawlingProcess
* @returns {Promise<void>} Completes when no URLs remain in the queue
*/
export async function continueCrawlingProcess() {

    console.log("Crawling Process starts again where it stopped");

    // Continue crawling until no URLs remain in queue
    while (await hasNextUrl()) {

        // Fetch next URL entry from queue table
            const entry = await getNextUrlFromDB();
            const url = entry.url_of_source;
            const parentUrl = entry.parent_url ?? null;

        try {
            //get the json from the url
            const res = await fetch(url)
            const STACObject = await res.json()

            console.log(`Crawling: ${url}`);
            
            // Only proceed if valid JSON was retrieved
            if (validateStacObject(STACObject).valid) {

                //for Catalogs: put the child urls into the queue
                //for Collections: put the child urls into the queue, save the data in the sources/collections db
                await handleSTACObject(STACObject, url, parentUrl)
        
                } else {
                    logger.warn("Warning: Invalid STAC object")
                }
            
        } catch(err) {
            logger.warn(`Warning: Did not crawled the following url: ${url} because of the following error: ${err}`)
        }
        
        // Remove processed URL from queue to avoid re-processing
        await removeFromQueue(url);
        await sleep(CRAWL_DELAY_MS);
    }

    console.log("Crawling finished");
}