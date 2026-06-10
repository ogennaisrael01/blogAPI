import { QueueEvents } from "bullmq";
import { redis } from "../lib/redis";

export const taskEvents = new QueueEvents("processing-tasks", { connection: redis as any })

taskEvents.on("completed", ({jobId}) => {
    console.log(`Job ${jobId} Completed successfully`)
})

taskEvents.on("failed", ({jobId, failedReason}) => {
    console.log(`Failed Job ${jobId}. Reason: ${failedReason}`)
})

taskEvents.on("error", (err) => {
    console.log(`Queue Error: ${err}`)
})
