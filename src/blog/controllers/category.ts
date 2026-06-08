import { Response, Request } from "express";
import { categorySchema, tagsSchema } from "../validators";
import { prisma } from "../../prisma-client";

export const addCategory = async (req: Request, res: Response) => {
    const result = categorySchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json(
            { errors: Object.keys(result.error.flatten().fieldErrors).length === 0 ? result.error.flatten().formErrors: result.error.flatten().fieldErrors}
        )
    }
    try{

        const category = await prisma.category.createMany({
            data: result.data,
            skipDuplicates: true
        })
        return res.status(201).json({details: category})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }

}
export const listCategories = async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc"}})
    return res.status(200).json({details: categories})
}

export const retrieveCategory = async (req: Request, res: Response) => {
    const slug = String(String(req.params.slug))
    if (!slug){
        return res.status(404).json({errors: "slug must be present"})
    }
    const category = await prisma.category.findUnique({where: {slug: slug}})
    return res.status(200).json({details: category})
}

export const addTags = async (req: Request, res: Response) => {
    const result = tagsSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({errors: result.error.flatten().fieldErrors})
    }
    try{
        const tags = await prisma.tag.createMany({ data: result.data, skipDuplicates: true})
        return res.status(201).json({details: tags})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const listTags = async (req: Request, res: Response) => {
    const tags = await prisma.tag.findMany({ orderBy: {name: "asc"}})
    return res.status(200).json({details: tags})
}

export const retrieveTag = async (req: Request, res: Response) => {
    const slug = String(String(req.params.slug))
    if(!slug){
        return res.status(400).json({errors: "slug is not present"})
    }
    try{
        const tag = await prisma.tag.findUnique({where: {slug}})
        return res.status(200).json({details: tag})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }

}