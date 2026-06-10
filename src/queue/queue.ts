import { Queue } from "bullmq";
import { redis } from "../lib/redis";


export const taskQueue = new Queue("task-processing", {
    connection: redis as any, 
    defaultJobOptions: {
        attempts: 5, removeOnComplete: 100, 
        removeOnFail: 500, backoff: {
             type: "exponential", delay: 5000
        }
    }
})