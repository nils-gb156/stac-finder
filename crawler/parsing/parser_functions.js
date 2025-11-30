/**
 * JSONToList
 * turns a given json file into a js list
 * @returns data_as_list; a list of js objects with the data from the json
 */
export function JSONToList(data) {

    //save data as js object
    const data_as_list = []

    for (const item of data) {
        const list_item = {
            id :  item.id,
            url : item.url,
            slug : item.slug,
            title : item.title,
            summary : item.summary,
            access : item.access,
            created : item.created,
            updated : item.updated,
            isPrivate : item.isPrivate,
            isApi : item.isApi,
            accessInfo : item.accessInfo
        }
        data_as_list.push(list_item)
    }

    //return the js object
    return data_as_list
}

/**
 * Parses a STAC Collection JSON and extracts key metadata.
 * @param {Object} json - The raw JSON object of a Collection
 * @returns {Object|null} A normalized object for the database or null if type is not 'Collection'.
 */
export function parseCollection(json) {

    // Validate input type
    if (!json || json.type !== 'Collection') {
        return null;
    }

    // Extract fields using optional chaining
    const bboxArray = json.extent?.spatial?.bbox?.[0];
    const timeInterval = json.extent?.temporal?.interval?.[0];

    // Return the structured metadata object
    return {
        id: json.id,
        title: json.title || json.id,
        description: json.description || "No description available",
        keywords: json.keywords || [],
        license: json.license || "proprietary",
        bbox: bboxArray || null,
        time_start: timeInterval?.[0] || null,
        time_end: timeInterval?.[1] || null,
        raw_json: json
    };
}
