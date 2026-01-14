
// imports 
import {
    addToQueue,
    getNextUrlFromDB,
    hasNextUrl,
    removeFromQueue
} from "./queue_manager.js";

import { loadUncrawledSources } from "./source_manager.js";
import { handleSTACObject, crawlStacApi } from "./crawler_functions.js";
import { validateStacObject } from "../parsing/json_validator.js";
import { logger } from "./src/config/logger.js";

/**
* Main crawler loop:
* - Loads uncrawled sources from DB
* - Strategy A (API): Crawls directly via /collections
* - Strategy B (Static): Adds to queue for recursive processing
*
* @async
* @function startCrawler
* @returns {Promise<void>} Completes when all APIs are done and the static queue is empty
*/
export async function startCrawler() {

    console.log("Crawler started");
 
    // we now load sources manually to check their type.
    const sources = await loadUncrawledSources(); //
    
    logger.info(`Found ${sources.length} sources to process.`);

    for (const source of sources) {
        if (source.type === 'API') {
            // Process directly, no queue needed for the collections list
            await crawlStacApi(source); //
        } else {
            // Add to queue to start the recursive crawling loop
            await addToQueue(source.title, source.url, null); //
        }
    }

    // This loop handles the recursive traversal for sources that were added to the queue
    while (await hasNextUrl()) {
        
        // Fetch next URL entry from queue table
        const entry = await getNextUrlFromDB(); //
        
        // Safety check
        if (!entry) break;

        const url = entry.url_of_source;
        const parentUrl = entry.parent_url ?? null;

        try {
            // Get the JSON from the URL
            const res = await fetch(url);
            
            if(!res.ok) throw new Error(`Status ${res.status}`);

            const STACObject = await res.json();

            console.log(`Crawling Static: ${url}`);
            
            // Only proceed if valid JSON was retrieved
            if (validateStacObject(STACObject).valid) { //

                // handleSTACObject handles recursion (finding children) and saving
                await handleSTACObject(STACObject, url, parentUrl);
        
            } else {
                logger.warn(`Warning: Invalid STAC object at ${url}`);
            }

        } catch (err) {
            logger.error(`Failed to crawl ${url}: ${err.message}`);
        } finally {
            // Always remove processed URL from queue to prevent infinite loops
            await removeFromQueue(url); //
        }
    }

    console.log("Crawling finished");
}