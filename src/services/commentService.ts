
import { commentStorage } from "../storage/blog";
import { Comment } from "../types/commentTypes";
import { blogService } from "./blogServices";



export class CommentService {
    constructor (){}

    async createComment (blogId: number, commentPayload: any) {
        try{

            const blog = await blogService.retreiveBlog(blogId)
            if (!blog.status){
                return blog
            }

            const email = commentPayload.email
            const name = commentPayload.name 
            const message = commentPayload.message

            const newComment: Comment = {
                commentId: commentStorage.length + 1,
                blogId,
                message,
                author: { email, name},
                createdAt: new Date(),
                updatedAt: new Date()
            }

            commentStorage.push(newComment)

            return { status: true, details: newComment}
        }
        catch (err: any){
            return { status: false, details: err.message}
        }
    }

    async listComment(blogId: number, offset: number, limit: number){
        const blog = await blogService.retreiveBlog(blogId)
        if (!blog){
            return blog
        }
        const comments = commentStorage.filter(comment => comment.blogId === blogId)
        const paginateComments = comments.slice(offset, offset + limit)
        return paginateComments
    }
}

export const commentService = new CommentService()