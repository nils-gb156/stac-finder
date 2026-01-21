import { startCrawler } from "./crawling/crawler_engine.js";
import { saveInBackup } from "./crawling/queue_manager.js";
import { logger } from "./crawling/src/config/logger.js"

//if someone stops the programm, save the data that is not yet uploaded lacally
process.on('SIGINT', () => {
  saveInBackup()
  process.exit(0)
})

process.on('SIGTERM', () => {
  saveInBackup()
  process.exit(0)
})

try {
  // start crawling process
  startCrawler()
} catch(err) {
  // if there is a error
  // save not uploaded data
  saveInBackup()

  // log the error
  logger.error(err)
}