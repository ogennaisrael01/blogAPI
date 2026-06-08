
import { promise, record } from "zod";
import { Category, Tag } from "../../../generate/prisma/browser";
import { Blog, BlogPostInteraction, User } from "../../../generate/prisma/client";
import { prisma } from "../../prisma-client"
import { BlogDetails, BlogInteraction, ObAccumulator } from "../types/blog.types";
import { id } from "zod/v4/locales";

export class BlogService {
    constructor() { }

    async createBlog(data: any, user: User, images: { url: string; public_id: string }[] | [], category: Category, tags: any) {
        const tagIds = tags.map((tag: any) => ({
            slug: tag.slug
        }))
        const newBlog: Blog = await prisma.blog.create({
            data: {
                title: data.title, description: data.description,
                images: JSON.parse(JSON.stringify(images)), authorId: user.id,
                published: true, categoryId: category.id, tags: { connect: tagIds }
            }
        })
        return newBlog

    }

    async listBlog(offset: number, limit: number, user: User) {
        const blogs = await prisma.blog.findMany({
            include: {
                tags: true, category: true, _count: { select: { likes: true, comments: true, bookmark: true } },
                author: { select: { email: true, fullName: true, isActive: true, id: true, profilePicture: true } },
                likes: { where: { userId: user?.id }, select: { id: true } },
                comments: { where: { authorId: user?.id }, select: { id: true } },
                bookmark: { where: { userId: user?.id }, select: { id: true } }
            }, orderBy: { createdAt: "desc" }
        })
        const paginatedBlogs = blogs.slice(offset, offset + limit)
        const customFeed = paginatedBlogs.map(blog => ({
            ...blog, isLiked: blog.likes.length > 0, likes: undefined,
            isCommented: blog.comments.length > 0, comments: undefined,
            isBookmarked: blog.bookmark?.length > 0, bookmark: undefined
        }))

        return customFeed
    }

    async retreiveBlog(blogId: string, user?: User) {
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
            include: {
                author: { select: { id: true, email: true, fullName: true, profilePicture: true } },
                comments: true, tags: true, category: true,
                _count: { select: { likes: true, comments: true, bookmark: true } },
                likes: { where: { userId: user?.id }, select: { id: true } },
                bookmark: { where: { userId: user?.id }, select: { id: true } }
            }
        })
        if (!blog) {
            return { status: false, details: "blog not found" }
        }
        const result = {
            ...blog,
            isLiked: blog.likes.length > 0,
            isBookmarked: (blog as any).bookmark?.length > 0
        }
        return { status: true, details: result }
    }

    async updateBlog(blogId: string, data: any) {
        try {
            const blog = await prisma.blog.update({
                where: { id: blogId },
                data: {
                    title: data.title, description: data.description,
                    images: data.images
                }
            })
            return { status: true, details: blog }
        }
        catch (err: any) {
            return { status: false, details: err.message }
        }
    }

    async deleteBlog(blogId: string) {
        try {
            const blog = await prisma.blog.delete({ where: { id: blogId } })
            return [true, "blog_deleted"]
        }
        catch (err: any) {
            return [false, String(err)]
        }
    }

    async categoriesBlog(categoryIds: string[]) {
        const blogs = await prisma.blog.findMany({
            where: { categoryId: { in: categoryIds } }, select: { id: true }
        })
        return blogs
    }

    async usersBlog(userIds: string[]) {
        const blogs = await prisma.blog.findMany({
            where: { authorId: { in: userIds } }, select: { id: true }
        })
        return blogs
    }

    async tagsBlog(tagIds: string[]) {
        const blogs = await prisma.blog.findMany({
            where: {
                tags: {
                    some: {
                        id: {
                            in: tagIds
                        }
                    }
                }
            }, select: { id: true }
        })
        return blogs
    }

    async userInteractions(user: User) {

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        const interactions = await prisma.blogPostInteraction.findMany({ // keep response light
            where: { userId: user?.id, createdAt: { gte: thirtyDaysAgo } },
            select: {
                id: true,
                blog: {
                    select: {
                        id: true,
                        author: { select: { id: true } },
                        category: { select: { id: true } },
                        tags: { select: { id: true } }
                    }
                }
            }
        })

        const result = interactions.reduce((accumulator: ObAccumulator, item: any) => {
            const authorId: string = item.blog.author?.id
            const categoryId: string = item.blog.category?.id
            const tagIds: string[] = item.blog.tags?.map((t: any) => t.id) || []

            if (authorId && !accumulator.authors.includes(authorId)) accumulator.authors.push(authorId)
            if (categoryId && !accumulator.categories.includes(categoryId)) accumulator.categories.push(categoryId)
            for (const tId of tagIds) if (tId && !accumulator.tags.includes(tId)) accumulator.tags.push(tId)

            return accumulator
        }, { authors: [], categories: [], tags: [] } as ObAccumulator)

        const [categoriesBlog, authorBlogs, tagsBlogs] = await Promise.all([
            this.categoriesBlog(result.categories),
            this.usersBlog(result.authors),
            this.tagsBlog(result.tags)
        ])
        return [...categoriesBlog, ...authorBlogs, ...tagsBlogs]

    }   

    async shuffleIds(ids: any) {
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [ids[i], ids[j]] = [ids[j], ids[i]]; 
        }

        return ids;
    }
}

export const blogService = new BlogService()