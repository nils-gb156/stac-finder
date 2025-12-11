import { validateStacObject } from "../parsing/json_validator.js"
import { addToQueue } from "./queue_manager.js"
import { logger } from "./src/config/logger.js"
import { getChildURLs } from "./crawler_functions.js"

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

        } else {
            return
        }
    } else {
        logger.warn("Warning: Invalid STAC object")
    }
}