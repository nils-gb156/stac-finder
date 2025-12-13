//imports
import { validateStacObject } from "../parsing/json_validator.js"
import { addToQueue } from "./queue_manager.js"
import { logger } from "./src/config/logger.js"

//helping functions for the crawler engine

//TODO: evtl. mit STAC js arbeiten

export async function handleSTACObject(STACObject) {

    //only run the following code if the stac object is valid
    if (validateStacObject(STACObject).valid) {
        
        //check the type of the stac object
        let STACObjectType = STACObject.type

        //depending on the type, run the following code:
        if (STACObjectType == "Catalog") {

            //get the titles and urls of the childs
            let childs = getChildURLs(STACObject)

            //put the URLs into the queue
            for (let child of childs) {
                await addToQueue(child.title, child.url)
            }

        } else if (STACObjectType == "Collection") {
            
            //get the title and the urls of the childs
            let childs = getChildURLs(STACObject)

            //put the URLs into the queue
            for (let child of childs) {
                await addToQueue(child.title, child.url)
            }

            //TODO: Source / Collection Daten hochladen

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
 * @returns childURLs - a list of objects containing title and url of the childs
 */
export function getChildURLs(STACObject) {

    //initialize the URL list
    let childURLs = []

    //for every child link push the URL and the title to the URL list
    for (let link of STACObject.links) {
        if (link.rel == "child") {
            childURLs.push({
                title: link.title || "no title", 
                url: link.href
            })
        }
    }

    return(childURLs)
}