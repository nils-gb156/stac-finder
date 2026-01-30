import { logger } from "./logging/logger";
import { clearQueue } from "./queueManager/queue_manager";

logger.info("Deleting Data from Queue \n ...")

//delete Data from the queue
await clearQueue()