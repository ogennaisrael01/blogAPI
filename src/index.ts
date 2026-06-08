import express, { Request, Response } from "express";
import "dotenv/config";
// import { commentRouter } from "./blog/routes/comment.rt";
import { router as blogRouter } from "./blog/apis/blog.route";
import { userRouter } from "./user/api/u.routes";
import { router as categoriesRouter } from "./blog/apis/categories";
import { createServer } from "node:http";
import { Server } from "socket.io"
import { prisma } from "./prisma-client";
import { commentManager, likeManager } from "./websocket/managers";
import cors from "cors";

const app = express();

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

const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', "POST"]
    }
})
function startServer () {
    const port = Number(process.env.PORT) || 3000
    const hostName = process.env.HOST_NAME || "localhost"
    server.listen(port, hostName, () => {
        console.log(`Server Runnig On Port: ${port}`)
    })
}
startServer()

interface UserConnection {
    userId: string
}
interface IncomingEvent {
    event: string,
    payload: Record<string, any>,
    timestamp?: Date
}
interface OutEvent {
    event: string,
    payload: Record<string, any>,
    serverTimestamp?: Date
}

const Events = Object.freeze({
    SYNC_REQUEST: "sync_request",
    LIKE: "like",
    Comment: "comment",
    BookMark: "bookmark"
})

io.on("connection", (socket) => {
    console.log("Connected..:", socket.id);
    socket.on("userSocket", async (data: UserConnection) => {
        const userId = String(data.userId)
        const exists = await prisma.user.findUnique({where: {id: userId}})
        if(!exists){
            socket.disconnect();
        }; socket.join(userId)
        io.to(userId).emit("receive_message", {
            event: Events.SYNC_REQUEST, status: "connected",
            timeStamp: new Date(), socketId: socket?.id, userId: exists?.id
        })
    });

    socket.on("send_message", async (data: IncomingEvent) => {
        const event = data?.event
        if (!event) {
            socket.disconnect();
        }
        const payload = data?.payload
        switch (event) {
            case Events.LIKE:
                try{
                    const data = await likeManager(payload?.userId, payload?.blogId)
                
                    const message: OutEvent = {
                        event: Events.LIKE, payload: {
                            likedBy: data.likeFullName, message: `${data.likeFullName} liked your blog post`}, 
                        serverTimestamp: new Date() }

                    io.to(data.authorId??[]).emit("receive_message", message)
                }
                catch (err: any){
                    socket.disconnect();
                }
                break;

            case Events.Comment: 
                try{
                    const data = await commentManager(payload.commentId, payload.userId)
                    const message: OutEvent = {event: Events.Comment, payload: {
                        commentedBy: data.commentedBy, message: `${data.commentedBy} commented on your blog post`
                    }, serverTimestamp: new Date()}

                    io.to(String(data.authorId)).emit("receive_message", message)
                }
                catch (err:any){
                    socket.disconnect();
                } 
                break;
            case Events.BookMark: 
                try{
                    const userId = payload?.userId
                    const message: OutEvent = { event: Events.BookMark, payload: {
                        userId: userId, message: "Your bookmark was added successfully"
                    }, serverTimestamp: new Date()}
                    io.to(String(userId)).emit("receive_message", message)
                }
                catch (err:any){
                    socket.disconnect();
                }
        }
    });
});