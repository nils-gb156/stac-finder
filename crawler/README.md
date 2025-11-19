### Crawler

## Ordnerstruktur

crawler/
│
├─ crawling/
│  ├─ crawler_engine.js        # crawlt die URLs / gibt JSONs an den parser weiter
│  ├─ crawler_functions.js     
│  └─ source_manager.js        # Verwaltung der URLs/Queue
│
├─ data_management/
│  ├─ api_client.js            # Holt JSON über API
│  └─ db_writer.js             # Schreiben in SQL-Datenbank
│
├─ entry_crawler/              # alles nicht so relevent weil eh nur entry
│  ├─ .vscode     
│  ├─ .src/     
│  └─ rest        
│
├─ parsing/
│  ├─ parser.js                #parst JSONs, übergibt daten an db_writer und links an den crawler
│  └─ parser_functions.js       
│
├─ scheduler.js                # Startet parsen der STAC-Index-JSON
│
├─ tests/
│
├─ .gitignore
│
└─ README.md