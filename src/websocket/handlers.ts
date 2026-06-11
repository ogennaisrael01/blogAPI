import { Server, Socket } from "socket.io";
import { createNotifications } from "../user/dependencies";
import { Events, OutEvent } from "./types";
import { commentManager, likeManager } from "./managers";


export async function likeHandler(payload: Record<string, string>, io: Server, socket: Socket) {
    // required (1) userId (the user liking the post) (2) blogId (the  blog post liked)
    if (!payload.userId && !payload.blogId){
        // sent message back to the open connection 
        socket.emit("receive_message", {errors: "userId and blogId are required"})
    }
    try{
        const data = await likeManager(payload.userId, payload.blogId)
        const message: OutEvent = {
            event: Events.Like, payload: {
                likedBy: data.likeFullName, message: `${data.likeFullName} liked your blog post`}, 
            serverTimestamp: new Date() }
        await createNotifications(data.authorId??"", payload.userId, Events.Like)
        io.to(data.authorId??[]).emit("receive_message", message)
    } catch (error) {
        socket.emit("receive_message", {errors: "An error occurred while processing the like"})
    }
}

export async function commentHandler(payload: Record<string, string>, io: Server, socket: Socket) {
    // required payload 
    // userId (user who made the comment)
    // blogId ( the blog post commented on)
    if (!payload.userId && !payload.blogId){
        socket.emit("receive_message", {errors: "userId and blogId are required"})
    }
    try{
        const data = await commentManager(payload.blogId, payload.userId)
        const message: OutEvent = {event: Events.Comment, payload: {
            commentedBy: data.commentedBy, message: `${data.commentedBy} commented on your blog post`
        }, serverTimestamp: new Date()}

        io.to(data.authorId??[]).emit("receive_message", message)

        await createNotifications(data.authorId??"", payload.userId, Events.Comment)
    }
    catch (err: any){
        socket.emit("receive_message", {errors: "An error occurred while processing the comment"})
    }
}

export async function bookmarkHandler(payload: Record<string, string>, io: Server, socket: Socket) {
    // just the userId of the client and echo the message back to the client
    if (!payload.userId){
        socket.emit("receive_message", {errors: "userId is required"})
    }
    try{
        const message: OutEvent = { event: Events.BookMark, payload: {
            userId: payload.userId, message: "Your bookmark was added successfully"
        }, serverTimestamp: new Date()}
        io.to(payload.userId).emit("receive_message",message)
    }
    catch (err:any){
        socket.emit("receive_message", {errors: "An error occured while processing bookmark."})
    }
}

export async function  newsLetterHandler(payload: Record<string, string>, io: Server, socket: Socket) {
    // requires (payload)
    // 1: the userId for the user being subcribed to.
    // 2: the fullName of the client who subscribed
    if (!payload.userId && !payload.fullName){
        socket.emit("receive_message", {error: "the userId and the subscriber fullName is required"})
    }
    try{
        const message: OutEvent = {
            event: Events.NewsLetter, payload: {
                userId: payload.userId, message: `${payload.fullName} just subscribed to your newsletter`,
            }, serverTimestamp: new Date()
            }
        io.to(payload.userId).emit("receive_message", message)
    }   
    catch (err:any){
            socket.emit("receive_message", {errors: "An error occured while processing newsletter request"})
        }
}