# Crawler Documentation

This guide explains how to use the STAC Finder Crawler.


TODO Extentionst usw.
The crawler runs in node js and needs a connection to the STAC Finder Database. You can find deatils about the database access in the [Database Documentation](../database/database-access.md)

---

## Installations
TODO: Welche Dependencies brauchen wir wirklich?
To install the dependencies, navigate to the path "crawler\" and type "npm install" into the terminal.

## Crawler Usage
To start the crawling process, make sure that you have a working connection to the Database. 
*for now:* Then create a temporal js file in the folder "crawler\crawling\tests" with the following code:

```bash
import { startCrawler } from "../crawler_engine.js";

await startCrawler()
```

TODO: Crawling start, wie er im finalen Prozess sein wird beschreiben

### What You'll See
Details about the crawling process will be shown in the terminal.

TODO: Was wird wann angezeigt?
## 
