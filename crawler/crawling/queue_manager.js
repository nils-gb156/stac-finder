/**
 * @file source_manager.js
 * @description Manages the crawlable STAC sources URLs and the dynamic crawling queue.
 */

//imports
import { logger } from "./src/config/logger.js"
import { query } from "./src/data/db_client.js"

//functions

/**
 * Adds a URL to the queue if not already present.
 * @param {string} title title of the url
 * @param {string} url 
 * @function addToQueue
 */
export async function addToQueue(title, url) {

    // validate URL format
    try {
        new URL(url)
    } catch {
        logger.warn(`Did not added the following invalid URL to the queue: ${url}`)
        return
    }

    // validate title
    if (typeof title !== "string") {
        logger.warn(`Did not added the following invalid entry with the title: ${title}`)
        return
    }

    //check if the url is already in the queue
    if (await isInQueue(url)){
        logger.info(`Did not added the following url: ${url}, because it is already in the queue`)
        return
    }

    try {
        //upload title and url
        await query(`
            INSERT INTO stac."urlQueue" (title_of_source, url_of_source)
            VALUES ($1, $2)`,
            [title, url]
        )
        
        //log uploaded Data
        logger.info(`Added to queue: ${title}, ${url}`)
    } catch(err) {
        //log error
        logger.warn(`Did not add the data to the queue because of the following error: ${err}`)
    }
}

/**
 * Removes a url from the queue
 * @param {string} url 
 */
export async function removeFromQueue(url){

    //check if the url is in the queue
    if (!(await isInQueue(url))){
        logger.info(`Did not remove the following url: ${url}, it is not in the queue`)
        return
    }
    
    try {
        //delete row
        await query(`
            DELETE FROM stac."urlQueue"
            WHERE url_of_source = $1`,
            [url])

        //log deleted Data
        logger.info(`Deleted from queue: ${url}`)
    } catch(err) {
        //log error
        logger.warn(`Did not deleted the data from the queue because of the following error: ${err}`)
    }
}

/**
 * Clears the current queue (e.g. at start of crawler run).
 * @function clearQueue
 */
export async function clearQueue() {
    
    try {
        //delete data
        await query(`
            DELETE FROM stac."urlQueue"`)

        //log deleted Data
        logger.info(`cleared queue`)
    } catch(err) {
        //log error
        logger.warn(`Did not cleared the queue because of the following error: ${err}`)
    }
}

/**
 * function shows if a url is already in the queue
 * @param {string} url 
 * @returns {boolean} true - if the url is in the database
 * @returns {boolean} false - if the url is not in the database
 */
export async function isInQueue(url){

    try{
        //select row
        const data = await query(`
            SELECT 1 FROM stac."urlQueue"
            WHERE url_of_source = $1`,
            [url])

        if (data.rowCount > 0){
            return true
        } else {
            return false
        }

    } catch(err) {
        logger.warn(`could not show if data is in queue because of the following error: ${err}`)
    }
}