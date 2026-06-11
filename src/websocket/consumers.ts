
import { UserConnection, Events, IncomingEvent } from "./types";
import { prisma } from "../prisma-client";
import { io } from "../index";
import { bookmarkHandler, commentHandler, likeHandler, newsLetterHandler } from "./handlers";


io.on("connection", (socket) => {
    console.log("Connected..:", socket.id);

    socket.on("userConnection", async (data: UserConnection) => {
        const userId = String(data.userId)
        const exists = await prisma.user.findUnique({where: {id: userId}})
        if(!exists){
            socket.emit("receive_message", JSON.stringify({errors: "User not found, invalid connection"}))
            return socket.disconnect();
        }; 

        socket.join(userId)
        io.to(userId).emit("receive_message", JSON.stringify({
            event: Events.SYNC_REQUEST, status: "connected",
            timeStamp: new Date(), socketId: socket?.id, userId: exists?.id
        }))
    });

    socket.on("send_message", async (data: IncomingEvent) => {
        const event = data?.event.toLowerCase()
        const payload: Record<string, any> = data.payload
        const handlers: Record<string, ((payload: Record<string, any>, io: any, socket: any) => Promise<any>) | null> = {
            like: likeHandler, comment: commentHandler,
            bookmark: bookmarkHandler, newsLetter: newsLetterHandler
        }
        const handler = handlers[event]
        if (handler) {
            try {
                await handler(payload, io, socket)
                return
            } catch (err: any) {
                return socket.emit("receive_message", {errors: err.message })
            }
        }
        else {
            return socket.emit("receive_message", {errors: "invalid event type"})
        }
    });
});