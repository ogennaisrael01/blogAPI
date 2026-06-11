import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import { Jobs } from "./types";
import { processEmail, processNewsLetterEmail } from "./emailHandler";


export const worker = new Worker("task-processing", async (job: Job) => {
    const name = job.name
    switch (name){
        case Jobs.EMAIL:
            await processEmail(job.data)
        case Jobs.NEWS_LETTER:
            const data = job.data
            await processNewsLetterEmail(job.data)
        default: 
            throw new Error("Invalid Job: " + name)

    }
}, { connection: redis as any, concurrency: 5})
