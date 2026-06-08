import { prisma } from "../prisma-client"

export const likeManager = async ( userId: string, blogId: string) => {
    try{
        const user = await prisma.user.findUnique({where: {id: userId}})
        const blog = await prisma.blog.findUnique({where: { id: blogId}, include: {author: true}})
        const authorId = blog?.author?.id
        return {
            authorId: authorId,
            likeFullName: user?.fullName, 
        }
    }
    catch (err: any){
        throw new Error(err.message)
    }

}

export const commentManager = async(commentId: string, userId: string) => {
    try{
        const user = await prisma.user.findUnique({where: {id: userId}})
        const comment = await prisma.comment.findUnique({where: {id: commentId}, include: { blog: { include: {author: true}}}})
        const blogAuthorId = comment?.blog?.authorId
        return {
            authorId: blogAuthorId,
            commentedBy: user?.fullName
        }
    }
        catch (err:any){
            throw new Error(err.message)
        }
}