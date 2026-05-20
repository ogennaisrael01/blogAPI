import { Request, Response } from "express";
import { commentService } from "../services/commentService";


export const addComment = async (req: Request, res: Response) => {

    const { email, name, message } = req.body
    const blogId = Number(String(req.params.blogId))

    if (!email || !name){
        return res.status(400).json({status: false, details: "email and name must be presnt"})
    }
    if (message.length < 5){
        return res.status(400).json({status: false, details: "Please add a meaninful comment."})
    }
    const newComment = await commentService.createComment(blogId, req.body)

    if (!newComment.status){
        return res.status(400).json(newComment)
    }
    return res.status(201).json(newComment)
}

export const listComentUnderPost = async (req: Request, res: Response) => {

    const blogId = Number(String(req.params.blogId))
    const page = Number(String(req.params.page)) || 1
    const limit = 10
    const offset = (page - 1) * limit

    const response = {
        page: page,
        limit: limit,
        result: await commentService.listComment(blogId, offset, limit)
    }
    return res.status(200).json(response)
}

