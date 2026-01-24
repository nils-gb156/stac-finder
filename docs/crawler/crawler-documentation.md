# Crawler Documentation

This guide explains how to use the STAC Finder Crawler.

The crawler runs on our STACFinder Server TODO:Server Zugang erklären
 <!-- and needs a connection to the STAC Finder database. You can find deatils about the database access in the [Database Documentation](../database/database-access.md) -->

---

TODO: Falls die Ordnerstruktur geändert wird, müssen wir die Pfade anpassen.

<!-- To start the crawling process, make sure that you have a working connection to the database. -->

## How to access the crawler via our server
To controll the crawler, open your terminal and get a connection to the server by typing:
```bash
ssh stac-finder@finder.stacindex.org
```
Enter the given password for the server and navigate to the folder "crawler\". 

## Installations
We use the dependencies ajv, ajv-formats, dotenv, pg, pm2 and winston. To install these, navigate to the path "crawler\" and type "npm install" into the terminal.

## Controling the Crawling Process
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

## Logging
Details about the crawling process will be displayed in the terminal, when you open the logs as described above.
There are three diffrent types of informations:

{timestamp} info: Provides information about the crawling process, such as "Crawler started" or "Added {number} URL's to the database"

{timestamp} warn: Shows Problems during the crawling process. These Problems could be invalid STAC-Objects or failed attempts to crawl a URL for example. They typically do not significantly impact the crawling result.

{timestamp} error: Shows serious Problems during the crawling process. Better stop the crawling process, as these errors often lead to a data loss, so that the affected collections can no longer be found later via the STACFinder. Depending on the error message, restart the crawling process or contact us if you experience persistent errors.

## The Data Management
We use the STACFinder Database for collecting data during the crawling process. For this purpose, we have four tables:
1. catalogs: table with the stac index catalogs
2. urlQueue: table to save the queue of uncrawled urls
3. sources: table to save informations about sources of collections
4. collections: table to save informations about the crawled collections. These are the informations you can look at on the STACFinder Website.

If you want to have a closer look on the collected data or our database, you can get access to our STACFinder Database as it is described in the [Database Documentation](../database/database-access.md).

## How does the crawler work?

The StartCrawler function controlls the crawling process. If the crawling process is interrupted, the remaining data in the urlData-Object is saved in a backup file to prevent data loss.

Here is how the StartCrawler function works:

    If a backup file exists, the crawler validates the data and adds it to the queue if its valid.
    The backup file is then deleted.
 
    Uncrawled sources are also added to the queue if they are valid.
 
    The crawler loads valid URL's from the STAC Index database tointo the queue if they are not already in the sources database.
    
    The crawling process continues until the queue is empty.
        
        The crawler retrieves the next URL from the queue table.
        
        The crawler feches the STAC JSON using a retry mechanism and validates it.
 
            If the STAC Object is a catalog, the crawler gets the child data and stores the catalog data in the sources database.
 
            If the STAC Object is a collection, the crawler gets the child data and stores the collection data 
            in the sources database and the collections database.
                
            The crawler then validates the child data and, if valid, adds it to an urlData-Object. 
 
            If an error occurs during this process, the url will not be crawled and the error is displayed.
 
        If the urlData object contains more than 1000 URLs or if the queue is empty, the data will be uploaded to the queue.
        The urlData-Object is then reset.
 
        The processed URL gets removed from the queue to avoid recrawling.
 
    Once the queue is empty, the crawling process is complete.
