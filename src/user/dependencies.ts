
import { prisma } from "../prisma-client";
import { Events } from "../websocket/types";

export async function createNotifications(ownerId: string, senderId: string | null, event: string) {
    const isValid = event in Events
    if (!ownerId){
        throw new Error("Owner ID is required to create a notification")
    }
    try{
        const notification = await prisma.notification.create({
            data: {ownerId: ownerId, senderId: senderId, event: event}
        })
        return notification
    }
    catch (err: any){
        throw new Error(err.message)
    }
}