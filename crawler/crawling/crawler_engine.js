import {
    initializeQueue,
    getNextUrlFromDB,
    hasNextUrl,
    addToQueue,
    removeFromQueue
} from "./queue_manager,js";

import { fetchJsonFromUrl, extractChildUrls } from "./crawler_functions.js"

export async function startCrawler() {

    console.log("Crawler started");

    await initializeQueue();

    while (await hasNextUrl()) {
        const entry = await getNextUrlFromDB();
        const url = entry.url_of_source;

        console.log(`Crawling: ${url}`);

        if (json) {
            const newUrls = extractChildUrls(json);

            for (const newUrl of newUrls) {
                await addToQueue(entry.title_of_source, newUrl);
            }
        }

        await removeFromQueue(url);
    }

    console.log("Crawling finished");
}