import {
    initializeQueue,
    getNextUrlFromDB,
    hasNextUrl,
    addToQueue,
    removeFromQueue
} from "./queue_manager.js";

import { fetchJsonFromUrl, extractChildUrls } from "./crawler_functions.js"

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

    // Continue crawling until no URLs remain in queue
    while (await hasNextUrl()) {
        
        // Fetch next URL entry from queue table
        const entry = await getNextUrlFromDB();
        const url = entry.url_of_source;

        console.log(`Crawling: ${url}`);
        
        // Only proceed if valid JSON was retrieved
        if (json) {

            // Extract recursively discovered URLs (child catalogs or collections)
            const newUrls = extractChildUrls(json);

            // Add discovered URLs to queue (avoids duplicates automatically)
            for (const newUrl of newUrls) {
                await addToQueue(entry.title_of_source, newUrl);
            }
        }

        // Remove processed URL from queue to avoid re-processing
        await removeFromQueue(url);
    }

    console.log("Crawling finished");
}
