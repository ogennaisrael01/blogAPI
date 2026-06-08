import { userService } from "../services/u.services";
import { Request, Response } from "express";
import { loginSchema, userSchema } from "../validators";
import { error } from "node:console";
import { User } from "../../../generate/prisma/client";
import { cloudinaryUpload } from "../../blog/cloudinaryConfig";
import { prisma } from "../../prisma-client";
import { issueTokens } from "../../jwt/tokens";


export const register = async (req: Request, res: Response) => {
    const result = userSchema.safeParse(req.body)
    if (!result.success){
        return res.status(400).json({errors: result.error.flatten().formErrors})
    }
    const { email, password, fullName } = result.data
    try{
        const user = await userService.createUser(email, password, fullName);
        // duplicate email is handled by prisma
        return res.status(201).json({"success": true, details: {userId: user.id, message: "User created"}})
    }catch (err: any){
        return res.status(400).json({errors: err.message})
    }
}

export const login  = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({errors: result.error.flatten().formErrors})
    }
    const { email, password } = result.data
    const user = await userService.getUser(email)
    if (!user){
        return res.status(404).json({details: "User not found"}) 
    }
    if(!user.isActive){
        return res.status(400).json({details: "account is not active"})
    }
    if (!user.emailVerified){
        return res.status(400).json({details: "account not verified"})
    }
    if (!await userService.checkPassword(password, user.password)){
        return res.status(400).json({errors: "password errors"})
    }
    const tokens= await issueTokens(user)
    return res.status(200).json({errors: "negative", tokens , tokenType: 'Bearer'})
}

export const profilePicture = async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined
    if (file){
        try{
            const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const user: User = req.user
            const data = await cloudinaryUpload(fileStr)
            
            const profilePicture = { secure_url: data.secure_url, public_id: data.public_id}
            const update = await prisma.user.update({
                where: {id: user.id},
                data: { profilePicture: profilePicture}
            })
            return res.status(200).json(profilePicture)
        }
        catch (err: any){
            return res.status(500).json({errors: err.message})
        }
    }
}

export const userProfile = async (req: Request, res: Response) => {
    const user: User = req.user
    try{
        const profile = await prisma.user.findUnique({
            where: {id: user.id}, select: {id: true, email: true, fullName: true, profilePicture: true, createdAt: true,
                isActive: true
            }
        })

        return res.status(200).json({details: profile})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}
