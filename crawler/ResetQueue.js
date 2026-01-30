import { logger } from "./logging/logger.js";
import { clearQueue } from "./queueManager/queue_manager.js";

logger.info("Deleting Data from Queue \n ...")

//delete Data from the queue
await clearQueue()