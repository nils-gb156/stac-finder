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
 * @param {string} sourceId - ID of the source 
 * @param {string} crawledAt - Timestamp of the crawl
 * @returns {Object|null} A normalized object or null if type is not 'Collection'.
 */
export function parseCollection(json, sourceId, crawledAt) {

    // Validate input type
    if (!json || json.type !== 'Collection') {
        return null;
    }

    // Helper: Normalize single values to arrays 
    const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

    // Extract nested fields safely
    const bboxArray = json.extent?.spatial?.bbox?.[0];
    const timeInterval = json.extent?.temporal?.interval?.[0];
    const summaries = json.summaries || {};

    // Return the structured metadata object
    return {
        // Basic fields
        id: json.id,
        title: json.title || json.id,
        description: json.description || null,

        // Source info 
        source_id: sourceId || null,
        last_crawled_timestamp: crawledAt || null,

        // Extents
        bbox: bboxArray || null,
        temporal_start: timeInterval?.[0] || null,
        temporal_end: timeInterval?.[1] || null,

        // Search Fields
        keywords: json.keywords || [],
        providers: toArray(json.providers),
        license: json.license || null,
        doi: json['sci:doi'] || json.doi || null,

        // Summaries
        platform: toArray(summaries.platform),
        constellation: toArray(summaries.constellation),
        gsd: toArray(summaries.gsd),
        processing_level: toArray(summaries['processing:level']),

        // Archiving 
        raw_json: structuredClone(json)
    };
}
