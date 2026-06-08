import OpenAI  from "openai";
import "dotenv/config"
import { Blog } from "../../../generate/prisma/browser";

class AIService {

    private apiKey: string
    private baseUrl: string

    constructor() {
        this.apiKey = process.env.TOKEN_MIX_API_KEY ?? "secure_secret_key"
        this.baseUrl = process.env.TOKEN_MIX_BASE_URL ?? "http://127.0.0.1:3000"

        this.validateApiKey(this.apiKey)
    }
    validateApiKey (apiKey: string){if (!apiKey.startsWith("sk-tm")) throw new Error ("API key is invalid")}

    async getClient(): Promise<OpenAI>{
        const client = new OpenAI({ baseURL: this.baseUrl, apiKey: this.apiKey})
        return client
    }

    async cleanContext (context: string){
        const limit = 6000 // max words 
        const optimized = context.length > limit ? context?.substring(0, limit) + "..." : context
        return optimized
    }
    async prompt  () {
        return 'You are a professional editor. Summarize the following blog post in exactly 3 bullet points. Keep total length under 150 words.'
    }

    async generateBlogSummary(blog: Blog | null){
        const [ context, client, prompt ] = await Promise.all([
            this.cleanContext(blog?.description ?? ""), this.getClient(), this.prompt()
        ])
        const userPrompt = `Title: ${blog?.title}\n\nDescription: ${context}`

        const stream =  client.chat.completions.create({
            model: "gemini-2.5-flash", stream: true,
            messages: [
                {role: "system", content: prompt},
                {role: "user", content: userPrompt}
            ]
        })
        return stream
    }
}

export const aiService = new AIService()