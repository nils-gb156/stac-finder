//imports
import { upsertCollection, upsertSource } from "../data_management/db_writer.js"
import { validateStacObject } from "../parsing/json_validator.js"
import { addToQueue } from "./queue_manager.js"
import { logger } from "./src/config/logger.js"

//helping functions for the crawler engine

//TODO: evtl. mit STAC js arbeiten

/**
 * @function handleSTACObject
 * saves child urls and collection data based on the type of the given stac object
 * @param {JSON} STACObject - given stac object, any type
 * @param {*} Link - link to the stac object
 * @returns 
 */
export async function handleSTACObject(STACObject, Link) {

    //only run the following code if the stac object is valid
    if (validateStacObject(STACObject).valid) {
        
        //check the type of the stac object
        let STACObjectType = STACObject.type

        //depending on the type, run the following code:
        if (STACObjectType == "Catalog") {

            //get the titles and urls of the childs
            let childs = getChildURLs(STACObject, Link)

            //put the URLs into the queue
            for (let child of childs) {
                await addToQueue(child.title, child.url)
            }

        } else if (STACObjectType == "Collection") {
            
            //get the title and the urls of the childs
            let childs = getChildURLs(STACObject, Link)

            //put the URLs into the queue
            for (let child of childs) {
                await addToQueue(child.title, child.url)
            }

            //save source data
            let sourceData = {
                url: Link,
                title: STACObject.title,
                type: STACObject.type
            }

            //insert source data into source table
            await upsertSource(sourceData)
            logger.info("added Source data to Database")

            //save collection data
            await upsertCollection(STACObject)
            logger.info("added Collection data to Database")

        } else {
            return
        }
    } else {
        logger.warn("Warning: Invalid STAC object")
    }
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

    //save the link to the STACObject as selfURL. Remove the last index to replace it with the child url 
    let selfURL = Link.substring(0, Link.lastIndexOf('/'));

    //for every child link push the URL and the title to the URL list
    for (let link of STACObject.links) {
        if (link.rel == "child") {

            //save the childURL
            let childURL = link.href
            
            //if the childURL is not a valid url because it is given related to the parent url, add it to the parent url
            try {
                new URL(link.href)
            } catch {
                childURL = selfURL + childURL
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