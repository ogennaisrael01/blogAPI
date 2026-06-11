import { Request, Response } from "express";
import { prisma } from "../../prisma-client";
import { User } from "../../../generate/prisma/browser";

export const subscribe = async (req: Request, res: Response) => {
    const userId = String(String(req.params.userId))
    const subscriber: User = req.user
    if (!userId){
        return res.status(400).json({errors: "You need to provide the user you are subscribing to."})
    }
    try{
        // check if already subscribed
        const existing = await prisma.newsLetter.findFirst({where: {ownerId: userId, subscriberId: subscriber.id}})
        if(existing){
            return res.status(200).json({detail: "You already subscribed to this newsletter"})
        }

        // add subscriber
        const newsletter = await prisma.newsLetter.create({
            data: {
                ownerId: userId, subscriberId: subscriber.id
            }
        })

        return res.status(201).json({detail: `successfully subscribed to  ${newsletter.ownerId} newsletter. 
            \nYou will be the first receive all their blog posts.`})

    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const unsubscribe = async (req: Request, res: Response) => {
    const userId = String(String(req.params.userId))
    const subscriber: User = req.user
    try{
        if (! await prisma.newsLetter.findFirst(
            {where: {ownerId: userId, subscriberId: subscriber.id}})
        ){
            return res.status(400).json({errors: "Invalid request: subcription not found"})
        }
        
        await prisma.newsLetter.delete({where: {ownerId_subscriberId: { ownerId: userId, subscriberId: subscriber.id}}})
        return res.status(200).json({detail: "subscription removed"})

    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const subscriptions = async (req: Request, res: Response) => {
    let userId = String(String(req.params.userId)) ?? req.user.id
    try{
        const subscriptions = await prisma.newsLetter.findMany({
            where: {ownerId: userId}, 
            select: {
                subscriber: {select: { fullName: true, profilePicture: true, email: true, id: true}}
            }})

        return res.status(200).json({result: subscriptions})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}
