import { Response, Request } from "express";
import { prisma } from "../../prisma-client";

export const likePost = async (req: Request, res: Response) => {
    const blogId = String(String(req.params.blogId))
    if (!blogId){
        return res.status(400).json({errors: "blog id must be present in path params"})
    }
    const blog = await prisma.blog.findUnique({where: {id: blogId}, include: { likes: true}})
    if(!blog){
        return res.status(404).json({errors: "blog not found"})
    }
    const userId = req.user?.id
    const existingLike = await prisma.like.findUnique({ where: { userId_blogId: { userId: userId, blogId: blogId } } })
    if (existingLike) {
        return res.status(302).json({errors: "you already liked this post"})
    }
    try{
        const like = await prisma.like.create({data: {userId: userId, blogId: blog.id}})
        return res.status(201).json({details: `You liked a blog post with id: ${blog.id}`})
    }
    catch (err:any){
        return res.status(500).json({errors: err.message})
    }
}

export const unlikePost = async (req: Request, res: Response) => {
    const blogId = String(String(req.params.blogId))
    if(!blogId){
        return res.status(400).json({errors: "blogId must be preset in path params"})
    }
    const userId = req.user?.id
    try{
        const like = await prisma.like.delete({where: { userId_blogId: { userId: userId, blogId: blogId}}})
        return res.status(204).json({details:"unliked"})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}
