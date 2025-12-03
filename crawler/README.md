### Crawler

## Ordnerstruktur

crawler/
│
├─ crawling/
│  ├─ src/     
│  ├─ tests/
│  ├─ crawler_engine.js        # crawlt die URLs / gibt JSONs an den parser weiter
│  ├─ crawler_functions.js     
│  └─ source_manager.js        # Verwaltung der URLs/Queue
│
├─ data_management/
│  ├─ api_client.js            # Holt JSON über API
<<<<<<< HEAD
│  └─ db_writer.js             # Schreiben in SQL-Datenbank  
=======
│  └─ db_writer.js             # Schreiben in SQL-Datenbank     
>>>>>>> 5d1109f7a589f3c58bc91d58dd652dd44cc653b3
│
├─ parsing/
│  ├─ parser.js                #parst JSONs, übergibt daten an db_writer und links an den crawler
│  └─ parser_functions.js       
│
├─ scheduler.js                # Startet parsen der STAC-Index-JSON
│
├─ tests/
│  └─ test_crawling.json
│
├─ .gitignore
│
└─ README.md














axios
