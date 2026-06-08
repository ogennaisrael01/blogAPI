import { Request, Response, NextFunction } from "express"
import { User } from "../../generate/prisma/browser"

export const isOwner = <T>(getOwnerId: (req: Request) => Promise<T>) => async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    try{
        const ownerId = await getOwnerId(req)
        if (!ownerId){
            return res.status(404).json({"status": false, details: "No ownerId for the instance"})
        }
        
        if (ownerId !== req.user.id){
            return res.status(403).json({status: false, details: "You are not permitted to perform this action"})
        }
        next()
    }
    catch (err: any){
        return res.status(500).json({status: false, details: String(err.message)})
    }
}

export const userRole = ( role: string) => async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user
    const currentUserRole = user.role
    if (role !== currentUserRole){
        return res.status(403).json({errors: "You are not permitted to perform this action"})
    }
    next();
}