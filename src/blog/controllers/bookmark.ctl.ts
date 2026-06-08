import { Request, Response } from "express";
import { prisma } from "../../prisma-client";
import { User } from "../../../generate/prisma/browser";


export const bookmarkPost = async (req: Request, res: Response) => {
    const blogId = String(String(req.params.blogId))
    const user: User = req?.user
    const existing = await prisma.blog.findUnique({where: {id: blogId}, include: {bookmark: true}})
    if(!existing){
        return res.status(400).json({errors: "blog not found"})
    }
    if (existing.bookmark.length > 0){
        return res.status(400).json({errors: "you already bookmarked this post"})
    }

    try{
        const bookmark = await prisma.bookmark.create({data: {userId: user.id, blogId: existing.id}})
        return res.status(201).json({details: "Bookmark added"})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const removeBookmark = async (req: Request, res: Response) => {
    const blogId = String(String(req.params.blogId))
    const bookmarkId = String(String(req.params.bookmarkId))
    const user: User = req?.user
    try{
        const existing = await prisma.bookmark.findUnique({where: {id: bookmarkId}})
        if (!existing || existing.userId !== user.id || existing.blogId !== blogId) {
            return res.status(404).json({errors: 'bookmark not found or unauthorized'})
        }
        await prisma.bookmark.delete({where: { id: bookmarkId }})
        return res.status(200).json({details: "bookmark removed"})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const clearBookmark = async (req: Request, res: Response) => {
    const user: User = req.user
    try{
        const bookmarks = await prisma.bookmark.deleteMany({where: {userId: user.id}})
        return res.status(200).json({details: "bookmark cleared"})
    }
    catch (err: any){
        return res.status(500).json({eroros: err.message})
    }
}

const userBookmarks = async (user: User) => {
    const bookmarks = await prisma.bookmark.findMany({
            where: {userId: user.id},
            include: { 
                blog: {include: { 
                    author: {select: {id: true, email: true, fullName: true}}, 
                    tags: true, category: true, _count: { select: {likes: true, comments: true, bookmark: true}},
                    likes: {where: {userId: user.id}, select: {id: true}},
                    comments: {where: {authorId: user.id}, select: {id: true}}
                }},
            },
            orderBy: {createdAt: "desc"}
        })

    const customFeed = bookmarks.map(bookmark => ({
        ...bookmark,
        isLiked: bookmark.blog.likes.length > 0, 
        isCommented: bookmark.blog.comments.length > 0 
    }))

    return customFeed
}

export const listBookmarks = async(req: Request, res: Response) => {
    const user: User = req.user
    const page = Number(String(req.query.page)) || 1
    const size = Number(String(req.query.size)) || 20
    const offset = (page - 1) * size
    try{
        const bookmarks = await userBookmarks(user)
        const response = {
            page: page, limit: size, result: bookmarks.slice(offset, offset + size)
        }
        return res.status(200).json(response)
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}