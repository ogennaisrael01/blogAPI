import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import { Jobs } from "./types";
import { processEmail } from "./emailHandler";


export const worker = new Worker("task-processing", async (job: Job) => {
    const name = job.name
    switch (name){
        case Jobs.EMAIL:
            await processEmail(job.data)
        default: 
            throw new Error("Invalid Job: " + name)

    }
}, { connection: redis as any, concurrency: 5})
