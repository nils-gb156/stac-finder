//imports
import { getSourceIdByUrl, upsertCollection, upsertSource } from "../data_management/db_writer.js"
import { validateStacObject } from "../parsing/json_validator.js"
import { addToQueue } from "./queue_manager.js"
import { logger } from "./src/config/logger.js"

//helping functions for the crawler engine

//TODO: evtl. mit STAC js arbeiten

/**
 * @function handleSTACObject
 * saves child urls and collection data based on the type of the given stac object
 * @param {JSON} STACObject - given stac object, any type
 * @param {string} Link - link to the stac object
 * @param {string|null} parentUrl - url of the parent catalog/collection as stored in the queue
 * @returns 
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

            //set upload counter to 0
            let i = 0
            
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

                //put the URLs into the queue
                for (let child of childs) {
                    i = i + await addToQueueFn(child.title, child.url, Link)
                }

                loggerFn.info(`Added ${i} URL('s) to the queue`)

            } else if (STACObjectType == "Collection") {
                
                //get the title and the urls of the childs
                let childs = getChildURLsFn(STACObject, Link)

                //put the URLs into the queue and update the upload counter
                for (let child of childs) {
                    i = i + await addToQueueFn(child.title, child.url, Link)
                }

                loggerFn.info(`Added ${i} URL('s) to the queue`)

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

            } else {
                return
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

            
            let childURL
            
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