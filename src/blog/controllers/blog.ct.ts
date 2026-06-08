import { Request, Response } from "express";
import { blogInteractionsSchema, blogSchema } from "../validators";
import { blogService } from "../services/blog.sv";
import { cloudinaryUpload } from "../cloudinaryConfig";
import { prisma } from "../../prisma-client";
import { User } from "../../../generate/prisma/client";
import { Tag } from "../../../generate/prisma/browser";
import { blogInteractionTypes } from "../types/blog.types";
import { aiService } from "../services/AIService";


export const create = async (req: Request, res: Response) => {
    const validJson = JSON.parse(req.body.data)
    const result = blogSchema.safeParse(validJson)
    if(!result.success){
        return res.status(400).json({errors: result.error.flatten().formErrors})
    }
    let images: { url: string; public_id: string }[] = [];
    const user: User  = req.user
    const category = await prisma.category.findUnique({where: {slug: result.data.category_slug}})   
    let tags: Tag[] = []

    if (!category){
        return res.status(404).json({details: "category not found"})
    }
    if (result.data.tags){
        const tagResult = result.data.tags.map(async (slug) => {
            const tag = await prisma.tag.findUnique({where: {slug}})
            return tag
        })
        const valid_tags = await Promise.all(tagResult)
        tags = valid_tags.filter((tag): tag is NonNullable<typeof tag> => tag !== null);
    }
    if (req.files){ 
        const files = req.files as Express.Multer.File[];
        const uploadAll = files.map((file) => {
            const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            return cloudinaryUpload(fileStr)
        });
        const cloudinary_result = await Promise.all(uploadAll)
        images = cloudinary_result.map((r) => ({url: r.secure_url, public_id: r.public_id}));
    }
    try{
        const newPost = await blogService.createBlog(result.data, user, images, category, tags)
        return res.status(201).json({errors: null, details: newPost})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const listPost = async (req: Request, res: Response) => {
    const page: number = Number(String(req.query.page)) || 1
    const limit: number = 10
    const offset: number = (page - 1) * limit

    const response = {
        page: page,
        limit: limit,
        result: await blogService.listBlog(offset, limit, req.user)
    }
    return res.status(200).json({status: true, response})
}

export const retreiveBlog = async (req: Request, res: Response) => {
    const blogId: string = String(String(req.params.blogId))
    if (!blogId) {
        return res.status(400).json({ status: false, details: "blogId is required" })
    }
    try {
        const user = req.user
        const response = await blogService.retreiveBlog(blogId, user)
        if (!response.status) {
            return res.status(404).json(response)
        }
        return res.status(200).json(response)
    } catch (err: any) {
        return res.status(400).json({ status: false, details: err.message })
    }
}

export const updateBlog = async (req: Request, res: Response) => {
    const result = blogSchema.safeParse(req.body)
    if (!result.success){
        return res.status(400).json({errors: result.error.flatten().fieldErrors})
    }
    const blogId = String(String(req.params.blogId))
    if (!blogId){
        return res.status(404).json({status: false, details: "Blogid is not present."})
    }
    try{
        const updatedBlog = await blogService.updateBlog(blogId, result.data)
        return res.status(200).json(updatedBlog)
    }
    catch (err: any){
        return res.status(400).json({status: false, details: err.message})
    }

}

export const destroyBlog  = async (req: Request, res: Response) => {
    const blogId = String(String(req.params.blogId))
    if (!blogId){
        return res.status(404).json({status: false, details: "blogId is not present"})
    }
    try{
        const is_deleted = await blogService.deleteBlog(blogId)
        if (!is_deleted[0]){
            return res.status(400).json(is_deleted[1])
        }
        return res.status(204)
    }
    catch (err: any){
        return res.status(500).json({status: false, details: err.message})
    }
}

export const search = async (req: Request, res: Response) => {
    const q = String(String(req.query.q))
    try{

        const result = await prisma.blog.findMany({
            where: { OR: [
                {title: { contains: q }},
                { category: {name: {contains: q}}},
                {category: { slug: { contains: q}}},
                {author: {fullName: {contains: q}}},
                {tags: {some: {name: {contains: q}}}},
                {tags: {some: {slug: {contains: q}}}}
            ]}, 
            include: { 
                tags: true, category: true,
                author: {select: {
                    id: true, fullName: true, email: true, createdAt: true, profilePicture: true
                }}, _count: {select: { likes: true, comments: true, bookmark: true}}
            }
        })
        const total_result = result.length
        const response = {status: true, total_result, result}
        return res.status(200).json(response)
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const feed = async (req: Request, res: Response) => {
    const page = Number(String(req.query.page)) || 1;
    const size = Number(String(req.query.size)) || 10;
    const user: User | null = req?.user

    try{
        const totalBlogs = await prisma.blog.count({ where: { published: true } });
        if (totalBlogs === 0) {
            return res.status(200).json({ page, size, result: [] });
        }

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        let allIds;

        if (!user){
            allIds = await prisma.blog.findMany({
                    where: { published: true, createdAt: { gte: thirtyDaysAgo}},
                    select: { id: true },
                });
        }
        else{
            if (await prisma.blogPostInteraction.count({where: {userId: user.id}}) === 0){
                allIds = await prisma.blog.findMany({
                    where: { published: true, createdAt: { gte: thirtyDaysAgo}},
                    select: { id: true },
                });
            }
            else{
                allIds = await blogService.userInteractions(user) // Extract similar post id based on user interaction 
            }
        }

        const seen: string[] = []
        const findUnique = allIds.map(blog => seen.includes(blog.id) ? false : seen.push(blog.id))
        const shuffledIds = await blogService.shuffleIds(seen)
        const skip = (page - 1) * size;
        const pageIds = shuffledIds.slice(skip, skip + size);

        const result = pageIds.length
            ? await prisma.blog.findMany({
                where: { id: { in: pageIds } },
                include: {
                    tags: true,
                    category: true,
                    author: {select: {id: true, fullName: true, email: true, createdAt: true, profilePicture: true}},
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                            bookmark: true,
                        },
                    },
                    likes: {where: {userId: user?.id}, select: {id: true}},
                    comments: {where: {authorId: user?.id}, select: {id: true}},
                    bookmark: {where: {userId: user?.id}, select: {id: true}},
                },
            })
            : [];
        const customResult = result.map(blog => ({
            ...blog, 
            isLiked: blog.likes.length > 0, likes: undefined,
            isCommented: blog.comments.length > 0, comments: undefined,
            isBookmarked: blog.bookmark.length > 0, bookmark: undefined
        }))

        return res.status(200).json({ page, size, customResult });
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
};

export const userBlogs = async(req: Request, res: Response) => {
    const user: User = req.user
    try{

        const blogs = await prisma.blog.findMany({
            where: {authorId: user.id, published: true}, orderBy: { "createdAt": "desc"},
            include: {author: {select: {id: true, fullName: true, profilePicture: true, createdAt: true}}}
        })

        return res.status(200).json({details: blogs})
    }
    catch (err: any){
        return res.status(500).json({details: err.message})
    }
}

export const blogInteractions = async(req: Request, res: Response) => {
    /// only authenticated user interaction can be tracked currently
    const user: User = req.user
    const blogId = String(String(req.params.blogId))
    const result = blogInteractionsSchema.safeParse(req.body)

    if (!result.success){
        return res.status(400).json({errors: result.error.flatten().formErrors})
    }
    const { type } = result.data
    const isValid = type in blogInteractionTypes
    if (!isValid){
        return res.status(400).json({errors: "this type is not a valid interation type", type: JSON.stringify(blogInteractionTypes)})
    }
    try{
        const interation = await prisma.blogPostInteraction.create({
            data: {userId: user.id, blogId: blogId, type: type}
        })

        return res.status(201).json({detail: {status: true, message: "interaction recorded"}})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }

}

export const summarize = async (req: Request, res: Response) => {
    const blogId = String(String(req.params.blogId))
    const rRun = Boolean(req.query.rRun) ?? false
    try{

        if (!rRun){
            const checkSummary = await prisma.blogSummary.findFirst({where: {blogId: blogId}})
            const summary = checkSummary?.summary
            if (typeof summary === "string"){
                // only if the summary is considerable and feels useful
                return res.status(200).json({summary: checkSummary?.summary})
            }

            if (Array.isArray(summary)){
                for (const chunk of summary){
                    res.write(`${JSON.stringify(chunk)}\n\n`)
                    
                }
                return
            } 
        }
        // generate new summary 
        const blog = await prisma.blog.findUnique({where: {id: blogId}})
        const stream = await aiService.generateBlogSummary(blog)
        let dbSummary = []
        for await (const chunk of stream){
            const content = chunk.choices[0]?.delta?.content || "";
            if (content){
                // push content to sumamry-list and write to stram
                dbSummary.push(content)
                res.write(`${JSON.stringify(content)}\n\n`)
            }
        }
        const existing = await prisma.blogSummary.findFirst({where: {blogId: blogId}})
        const updateOrCreate = existing ? await prisma.blogSummary.update({
            where: {id: existing.id}, data: {summary: dbSummary}}
        ) : await prisma.blogSummary.create({data: { blogId: blogId, summary: dbSummary}})
    }
    catch (err: any){
        res.write(`Straming was block: \n${JSON.stringify({data: err})}\n\n`)
    }
    finally{
        res.end()
    }
}