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