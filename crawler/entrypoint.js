import { startCrawler } from "./crawling/crawler_engine.js";
import { saveInBackup } from "./crawling/queue_manager.js";

startCrawler()

process.on('SIGINT', () => {
  saveInBackup()
  process.exit(0)
})

process.on('SIGTERM', () => {
  saveInBackup()
  process.exit(0)
})