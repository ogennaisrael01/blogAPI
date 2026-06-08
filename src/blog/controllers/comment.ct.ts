import { Request, Response } from "express";
import { commentSchema } from "../validators";
import { commentService } from "../services/comment.sv";
import { prisma } from "../../prisma-client";
import { User } from "../../../generate/prisma/browser";

export const addComment = async (req: Request, res: Response) => {
    const result = commentSchema.safeParse(req.body)
    const blogId = String(String(req.params.blogId))
    if(!result.success){
        return res.status(400).json(
            { errors: Object.keys(result.error.flatten().fieldErrors).length === 0 ? result.error.flatten().formErrors: result.error.flatten().fieldErrors}
        )
    }  
    try{
    const newComment = await commentService.createComment(blogId, req.user, result.data.content, null)
    return res.status(201).json({details: newComment})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const list = async (req: Request, res: Response) => {
    const blogId = String(String(req.params.blogId))
    const page = Number(String(req.query.page)) || 1
    const limit = 10
    const offset = (page - 1) * limit
    const response = {
        page: page, limit: limit,
        result: await commentService.listComment(blogId, offset, limit)
    }
    return res.status(200).json(response)
}

export const update = async (req: Request, res: Response): Promise<any> => {
    const result = commentSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({errors: result.error.flatten().formErrors})
    }
    const commentId = String(String(req.params.commentId))
    const blogId = String(String(req.params.blogId))
    const user: User = req.user
    try{
        const existingComment = await prisma.comment.findFirst({
            where: { id: commentId, blogId: blogId, authorId: user?.id }
        })
        if (!existingComment) {
            return res.status(404).json({errors: 'Comment not found or unauthorized'})
        }
        const comment = await prisma.comment.update({
            where: { id: commentId },
            data: { content: result.data?.content }
        })
        return res.status(200).json({details: comment})
    }
    catch (err: any){
        return res.status(400).json({errors: err.message})
    }
}   

export const deleteComment = async (req: Request, res: Response): Promise<any> => {
    const commentId = String(String(req.params.commentId))
    const blogId = String(String(req.params.blogId))
    const user: User = req.user
    try{
        const existingComment = await prisma.comment.findFirst({
            where: { id: commentId, blogId: blogId, authorId: user?.id }
        })
        if (!existingComment) {
            return res.status(404).json({errors: 'Comment not found or unauthorized'})
        }
        await prisma.comment.delete({where: {id: commentId}})
        return res.status(204).send()
    }
    catch (err: any){
        return res.status(500).json({error: err.message})
    }
}
export const createNestedReply = async (req: Request, res: Response ) => {
    const blogId = String(String(req.params.blogId))
    const commentId = String(String(req.params.commentId))
    const result = commentSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({errors: result.error.flatten().formErrors})
    }
    try{
    const newComment = await commentService.createComment(blogId, req.user, result.data.content, commentId)
    return res.status(201).json({details: newComment})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }

}
export const listNestedResplies = async(req: Request, res: Response) => {
    const blogId  = String(String(req.params.blogId))
    const commentId = String(String(req.params.commentId))
    try{
        const replies = await prisma.comment.findMany({
            where: { parentId: commentId, blogId: blogId}, 
            include: {
                author: {select: {id: true, email: true, fullName: true, createdAt: true}}
            }
        })
        const response = {status: true, total: replies.length, result:replies}
        return res.status(200).json(response)
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const userComments = async(req: Request, res: Response) => {
    const user: User = req.user
    try{

        const comments = await prisma.comment.findMany({
            where: {authorId: user.id}, orderBy: {createdAt: "desc"}
        })
        return res.status(200).json({details: comments})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}