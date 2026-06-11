import express from "express";
import "dotenv/config";
// import { commentRouter } from "./blog/routes/comment.rt";
import { router as blogRouter } from "./blog/apis/blog.route";
import { userRouter } from "./user/api/u.routes";
import { router as categoriesRouter } from "./blog/apis/categories";
import { router as newsLetterRouter } from "./newsletter/api/routes"
import { createServer } from "node:http";
import { Server } from "socket.io";
import "./queue/events";
import "./queue/workers";
import cors from "cors";

export const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://c94b-102-90-102-219.ngrok-free.app", "https://dc59-102-91-99-36.ngrok-free.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json())
app.use("/api", blogRouter)
// app.use("/api", commentRouter)
app.use("/api", userRouter)
app.use("/api", categoriesRouter)
app.use("/api", newsLetterRouter)

export const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', "POST"]
    }
})

import "./websocket/consumers"

function startServer () {
    const port = Number(process.env.PORT) || 3000
    const hostName = process.env.HOST_NAME || "localhost"
    server.listen(port, hostName, () => {
        console.log(`Server Runnig On Port: ${port}`)
    })
}
startServer()

