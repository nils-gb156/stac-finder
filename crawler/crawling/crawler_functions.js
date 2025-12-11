//imports

//helping functions for the crawler engine

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

export function getSourceData(Collection) {
    
}

export function getCollectionData(Collection) {

}

export function writeSourceDataIntoDB(data) {

}

export function writeCollectionDataIntoDB(data) {
 
}