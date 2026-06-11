import { prisma } from "../prisma-client"

export const likeManager = async ( userId: string, blogId: string) => {
    try{
        const user = await prisma.user.findFirst({where: {id: userId}, select: { fullName: true, id: true}})
        const blog = await prisma.blog.findFirst({where: { id: blogId}, select: { authorId: true, id: true}})
        const authorId = blog?.authorId
        return {
            authorId: authorId,
            likeFullName: user?.fullName, 
        }
    }
    catch (err: any){
        throw new Error(err.message)
    }

}

export const commentManager = async(blogId: string, userId: string) => {
    try{
        const user = await prisma.user.findFirst({where: {id: userId}, select: {id: true, fullName: true}})
        const blog = await prisma.blog.findFirst({
            where: {id: blogId}, select: {authorId: true, id: true}
            })
        const blogAuthorId = blog?.authorId
        return {
            authorId: blogAuthorId,
            commentedBy: user?.fullName
        }
    }
        catch (err:any){
            throw new Error(err.message)
        }
}