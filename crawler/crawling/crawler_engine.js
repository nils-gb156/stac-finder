
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

    // get the urls from the STAC Index db
    const STACIndexData = await getSTACIndexData();
    
    //push the urls to the queue
    for (let data of STACIndexData) {
        await addToQueue(data.title, data.url);
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
    }

    console.log("Crawling finished");
}