import "dotenv/config";
import Redis from "ioredis";

export const redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379", {maxRetriesPerRequest:null}
)

redis.on("connect", () => {
    console.log("Redis instance connected successfully")
})

redis.on("error", (err) => {
    console.log(`failed redis connection. Reason: ${err}`)
})