
import { Request , Response} from "express";
import { BlogService } from "../services/blogServices";

export const postService = new BlogService()

export const create = async (req: Request, res: Response) => {
    
    const { email, name, title, description } = req.body

    if (!email || !name){
        return res.status(400).json({status: false, details: "name and email must be present"})
    }
    if (!title){
        return res.status(400).json({status: false, details: "post title must be present"})
    }

    const newPost = await postService.createBlog(req.body)
    if (!newPost.status){
        return res.status(400).json({status: false, details: newPost.details})
    }

    return res.status(201).json({status: true, details: newPost.details})
}

export const listPost = async (req: Request, res: Response) => {
    const page: number = Number(String(req.query.page)) || 1
    const limit: number = 10
    const offset: number = (page - 1) * limit

    const response = {
        page: page,
        limit: limit,
        result: await postService.listBlog(offset, limit)
    }
    return res.status(200).json({status: true, response})
}

export const retreiveBlog =async (req: Request, res: Response) => {
    const blogId: number = Number(String(req.params.blogId))
    try{
        const blog = await postService.retreiveBlog(blogId)
        return res.status(200).json(blog)
    }
    catch (err: any){
        return res.status(400).json({status: false, details: err.message})
    }
}

export const updateBlog = async (req: Request, res: Response) => {
    const blogId = Number(String(req.params.blogId)) ?? null
    if (!blogId){
        return res.status(404).json({status: false, details: "Blogid is not present."})
    }

    try{
        const updatedBlog = await postService.updateBlog(blogId, req.body)
        return res.status(200).json(updatedBlog)
    }
    catch (err: any){
        return res.status(400).json({status: false, details: err.message})
    }

}

export const destroyBlog  = async (req: Request, res: Response) => {
    const blogId = Number(String(req.params.blogId))
    if (!blogId){
        return res.status(404).json({status: false, details: "blogId is not present"})
    }
    try{
        const is_deleted = await postService.deleteBlog(blogId)
        if (!is_deleted.status){
            return res.status(400).json(is_deleted)
        }
        return res.status(204)
    }
    catch (err: any){
        return res.status(500).json({status: false, details: err.message})
    }
}