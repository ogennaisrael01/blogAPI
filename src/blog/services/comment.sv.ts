
import { User } from "../../../generate/prisma/browser";
import { prisma } from "../../prisma-client";
import { blogService } from "./blog.sv";


export class CommentService {
    constructor (){}

    async createComment (blogId: string, user: User, content: string, parantId: string | null) {
        const newComment = await prisma.comment.create({
            data: { content: content, authorId: user?.id, blogId: blogId, parentId: parantId}
        })

        return newComment
    }   
    async listComment(blogId: string, offset: number, limit: number){
        const comments = await prisma.comment.findMany({
            where: {blogId: blogId, parentId: null},
            orderBy: {createdAt: "desc"},
            include: {
                author: { select: {id: true, email: true, fullName: true}},
                replies: {
                    orderBy: {createdAt: "asc"},
                    include: {
                        author: { select: {id: true, email: true, fullName: true, profilePicture: true}}
                    }
                }
            },
        })
        const paginateComments = comments.slice(offset, offset + limit)
        return paginateComments
    }
}

export const commentService = new CommentService()