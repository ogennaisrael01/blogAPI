import { deflate } from "node:zlib";
import { BlogStorage } from "../storage/blog";
import { Blog } from "../types/blogTypes";
import { resourceUsage } from "node:process";


export class BlogService {
    constructor() {}

    async createBlog(blogPost: any) {
        try{

            const newblogPost:  Blog = {
                id: BlogStorage.length + 1,
                title: blogPost.title,
                author: { name: blogPost.name, email: blogPost.email},
                description: blogPost.description,
                date_published: new Date(),
                date_updated: new Date()

            }

            BlogStorage.push(newblogPost)
            return {status: true, details: newblogPost}
        }
        catch (err: any) {
            return { status: false, details: err.message}
        }
    }

    async listBlog(offset: number, limit: number){
        const blogPosts = BlogStorage.slice(offset, offset + limit)
        return blogPosts
    }

    async retreiveBlog(blogId: number){
        const blog = BlogStorage.find((u) =>  u.id === blogId)
        if (!blog){
            return { status: false, details: "Blog not Found"}
        }
        return { status: true, details: blog}
    }

    async updateBlog(blogId: number, updatePayload: any){
        let blog = BlogStorage.find((u) => u.id == blogId)
        if (!blog){
            return {status: false, details: "blog not found"}
        }
        try{
            blog.title = updatePayload.title ?? blog.title
            blog.description = updatePayload.description ?? blog.description
            blog.date_updated = new Date()

        }
        catch (err: any){
            return {status: false, details: err.message}
        }
        return await this.retreiveBlog(blog.id)
    }

    async deleteBlog (blogId: number){

        const blog = BlogStorage.findIndex(blog => blog.id === blogId)
        if (blog === -1){
            return {status: false, details: "blog is not present"}
        }
        try{
            BlogStorage.splice(blog, 1)
        }
        catch (err: any){
            return {status: false, details: err.message}
        }
        return {status: true, details: "delete blog"}
    }
}


export const blogService = new BlogService()