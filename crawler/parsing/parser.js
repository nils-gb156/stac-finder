//imports
import { readFileSync } from "fs"
import { JSONToList } from "./parser_functions.js"

function getDataFromJSONFile() {
    //load JSON
    //TODO: in the final project, the json should not be loaded from a file, we get it from the api then,
    //      but fo now, we use a smaler test json
    const parsed_data = JSON.parse(readFileSync("../tests/Test_crawling.json", "utf8"))
  return parsed_data
}

export async function startParser() {
    
    //TODO: validate_json() implementieren

    //TODO: load data from the json implementieren

    //load data from JSON file -> TODO: in the final project, the data should come from the api
    let data = getDataFromJSONFile()

    //transform the data into a list of js objects
    let data_as_list = JSONToList(data)
    //show data on console
    console.log("Parsed data:", data_as_list)

    //return status
    return { status: "ok", items: data_as_list }
}
