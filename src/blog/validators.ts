import * as z from "zod";

export const blogSchema = z.object({
    title: z.string().max(100).nonempty(),
    description: z.string().max(1000),
    category_slug: z.string().nonempty(),
    tags: z.array(z.string()).nullable()
})

export const blogInteractionsSchema = z.object({
    type: z.string().nonempty()
})

export const commentSchema = z.object({
    content: z.string().nonempty().min(10)
})

const service = z.object({
    name: z.string().nonempty(),
    description: z.string().nullable(),
    slug: z.string().nonempty().toLowerCase().regex(/^[a-z0-9-]+$/)
})


export const tagsSchema = z.array(service)
export const categorySchema = z.array(service)