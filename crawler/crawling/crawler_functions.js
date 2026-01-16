//imports
import { getSourceIdByUrl, upsertCollection, upsertSource } from "../data_management/db_writer.js"
import { validateStacObject } from "../parsing/json_validator.js"
import { addToQueue } from "./queue_manager.js"
import { logger } from "./src/config/logger.js"
import { markSourceCrawled } from "./source_manager.js"

//helping functions for the crawler engine

/**
 * @function handleSTACObject
 * saves catalog and collection data based on the type of the given stac object
 * @param {JSON} STACObject - given stac object, any type
 * @param {string} Link - link to the stac object
 * @param {string|null} parentUrl - url of the parent catalog/collection as stored in the queue
 * @returns {object} - child data (if the stac object is a collection)
 */
export function makeHandleSTACObject(deps = {}) {
    const {
        validateStacObject: validate = validateStacObject,
        upsertSource: upsertSourceFn = upsertSource,
        getSourceIdByUrl: getSourceIdByUrlFn = getSourceIdByUrl,
        upsertCollection: upsertCollectionFn = upsertCollection,
        addToQueue: addToQueueFn = addToQueue,
        getChildURLs: getChildURLsFn = getChildURLs,
        logger: loggerFn = logger,
    } = deps

    return async function handleSTACObjectImpl(STACObject, Link, parentUrl = null) {

        //only run the following code if the stac object is valid
        if (validate(STACObject).valid) {
            
            //check the type of the stac object
            let STACObjectType = STACObject.type

            // Track the source id of the currently crawled Catalog/Collection (self)
            let currentSourceId = null

            // Catalogs and Collections should be stored in sources
            if (STACObjectType === "Catalog" || STACObjectType === "Collection") {
                const sourceData = {
                    url: Link,
                    title: STACObject.title,
                    type: STACObject.type
                }
                currentSourceId = await upsertSourceFn(sourceData)
            }

            //depending on the type, run the following code:
            if (STACObjectType == "Catalog") {

                //get the titles and urls of the childs
                let childs = getChildURLsFn(STACObject, Link)

                return childs

            } else if (STACObjectType == "Collection") {
                
                //get the title and the urls of the childs
                let childs = getChildURLsFn(STACObject, Link)

                // Resolve parent source_id from sources table via parentUrl
                let parentSourceId = null
                if (parentUrl) {
                    parentSourceId = await getSourceIdByUrlFn(parentUrl)
                    if (!parentSourceId) {
                        loggerFn.warn(`Could not resolve parent source id for collection ${Link} (parentUrl=${parentUrl})`)
                    }
                } else {
                    // Root-collection (start URL) should link to itself as source
                    parentSourceId = currentSourceId
                }

                // save collection data with FK to its parent source (if available)
                await upsertCollectionFn({ ...STACObject, source_id: parentSourceId })

                return childs

            } else {

                //TODO: Hier warning?
                return null
            }
        } else {
            loggerFn.warn("Warning: Invalid STAC object")
        }
    }
}

const _defaultHandleSTACObject = makeHandleSTACObject()

export async function handleSTACObject(STACObject, Link, parentUrl = null) {
    return _defaultHandleSTACObject(STACObject, Link, parentUrl)
}

/**
 * @function getChildURLs 
 * gets the URLs and Titles of child objects of a given stac object
 * @param {JSON} STACObject a json object with stac structure
 * @param {string} Link the link to the stac Object
 * @returns childURLs - a list of objects containing title and url of the childs
 */
export function getChildURLs(STACObject, Link) {

    //initialize the URL list
    let childURLs = []


    //iterate through all links in STAC object
    for (let link of STACObject.links) {

        //process links that are marked as "child" and have a valid href
        if (link.rel === "child" && link.href) {

            
            let childURL = []
            
            //build full child URL from parent URL
            try {
                childURL = new URL(link.href, Link).href
            } catch {
                //skips invalid URLs without breaking crawl
                continue
            }
            
            //push the url and the title to the childURLs list
            childURLs.push({
                title: link.title || "no title", 
                url: childURL
            })
        }
    }

    return(childURLs)
}

/**
 * @function validateQueueEntry
 * validates a queue entry to make sure that only valid objects will be crawled
 * @param {string} title - title of a stac object
 * @param {string} url - url of a stac object
 * @param {string} parentUrl - parent url of a stac object
 * @returns true if everything is ok
 *          false if there is any Problem with the source
 */
export async function validateQueueEntry(title, url, parentUrl = null) {
    
    // validate URL format
    try {
        new URL(url)
    } catch {
        logger.warn(`Did not added the following invalid URL to the queue: ${url}`)
        //return false
        return false
    }

    // validate title
    if (typeof title !== "string") {
        logger.warn(`Did not added the following invalid entry with the title: ${title}`)
        //return false
        return false
    }

    // validate parentUrl 
    if (parentUrl != null) {
        try {
            new URL(parentUrl)
        } catch {
            logger.warn(`Did not add the following invalid parent URL to the queue: ${parentUrl}`)
            //return false
            return false
        }
    }

    return true
}