import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma-client";


export const blogIdRequired = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const blogId = String(String(req.params.blogId))
    if (!blogId){
        return res.status(400).json({errors: "blogId must be present in path params"})
    }
    const blog = await prisma.blog.findUnique({where: {id: blogId}})
    if(!blog){
        return res.status(400).json({errors: "blog not found"})
    }
    next();
}

export const commentIdRequired = async(req: Request, res: Response, next: NextFunction): Promise<any> => {
    const commentId = String(String(req.params.commentId))
    if (!commentId){
        return res.status(400).json({errors: "commentId must be present isn path params"})
    }

    next()
}

