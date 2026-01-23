# Crawler Documentation

This guide explains how to use the STAC Finder Crawler.

The crawler runs on our STACFinder Server TODO:Server Zugang erklären
 and needs a connection to the STAC Finder database. You can find deatils about the database access in the [Database Documentation](../database/database-access.md)

---

TODO: Falls die Ordnerstruktur geändert wird, müssen wir die Pfade anpassen.

## Installations
We use the dependencies ajv, ajv-formats, dotenv, pg, pm2 and winston. To install these, navigate to the path "crawler\" and type "npm install" into the terminal.

## Crawler Usage
To start the crawling process, make sure that you have a working connection to the database.

To controll the crawler, open your terminal and get a connection to the server. Then, navigate to the folder "crawler\". 

*Start the crawling process for the first time:*
```bash
pm2 start entrypoint.js
```
*Stop the crawling process:*
```bash
pm2 stop entrypoint.js
```
*Restart the crawling process:*
```bash
pm2 restart entrypoint.js
```
*To get informations about the crawling process:*
```bash
pm2 logs
```

TODO: funktioniert das alles so?

Details about the crawling process will then be shown in the terminal.

We use, as already mentioned, the STAC Finder Database. We use four tables to manage the Data:
1. catalogs: database with the stac index catalogs
2. urlQueue: queue to save the uncrawled urls
3. sources: database to save informations about sources of collections
4. collections: database to save informations about the crawled collections

TODO: Tables näher beschreiben -> Spaltennamen

### What You'll See
Details about the crawling process will be shown in the terminal.
You can look at all the data in the database on pgAdmin. Todo: Bekommen die da Zugang dazu?

TODO: Logging ausführlich beschreiben?
<!-- #### Start of the Crawling Process
Crawler started

#### If there are uncrawled URL's in the STAC Index Database, uncrawled Sources or URL's in a Backup file
Found *number* URL's in the backup file
Removed the backup file
Found *number* sources to process.
Added URL's from the STAC Index Database to the queue
Could not load STAC Index data, starting with existing queue only

#### Successful interaction with the queue 
Initialized queue with *length of the queue* source URLs
Added to queue: *title*, *url*
Did not added the following url: *url*, *reason*
Deleted from queue: *url*
Did not remove the following url: *url*
cleared queue

#### Unsuccessful interaction with the queue
Did not added the following invalid URL to the queue: *url*
Did not added the following invalid entry with the title *title*
Did not add the following invalid parent URL to the queue: *parentURL*
Did not add the data to the queue because of the following error: *error*
Did not deleted the data from the queue because of the following error: *error*
Did not cleared the queue because of the following error: *error*
Could not show if data is in queue because of the following error: *error*

#### Successful interaction with the databases
Loaded *number of sources* sources from the database
Loaded *number of sources* sources from the stac index database
Marked source *id* as crawled

#### Warnings:
Warning: invalid STAC object -->