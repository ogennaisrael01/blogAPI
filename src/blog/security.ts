
import { isOwner } from "../middlewares/permissions"
import { Request } from "express"
import { prisma } from "../prisma-client"

export const isBlogOwner = isOwner(async (req: Request): Promise<any> => {
    const blogId = String(String(req.params.blogId))
    const blog = await prisma.blog.findUnique({where: {id: blogId}})
    return blog?.authorId
})

export const isCommentOwner = isOwner( async(req: Request): Promise<any> => {
    const commentId = String(String(req.params.commentId))
    const comment = await prisma.comment.findUnique({where: {id: commentId}})
    return comment?.authorId
})
