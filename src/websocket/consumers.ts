
import { UserConnection, Events, IncomingEvent, OutEvent } from "./types";
import { prisma } from "../prisma-client";
import { likeManager, commentManager } from "./managers";
import { io} from "../index";


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