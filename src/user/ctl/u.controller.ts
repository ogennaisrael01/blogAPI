import { userService } from "../services/u.services";
import { Request, Response } from "express";
import { emailVerifySchema, getBody, loginSchema, passwordResetConfirmSchema, passwordResetSchema, sendVerificationSchema, userSchema } from "../validators";
import { User } from "../../../generate/prisma/client";
import { cloudinaryUpload } from "../../blog/cloudinaryConfig";
import { prisma } from "../../prisma-client";
import { BlackListToken, issueTokens } from "../../jwt/tokens";
import { Tokens } from "../types";
import { taskQueue } from "../../queue/queue";
import { id } from "zod/v4/locales";
import { get } from "node:http";
import { CommentScalarFieldEnum } from "../../../generate/prisma/internal/prismaNamespace";
import { truncate } from "node:fs/promises";


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
    return res.status(200).json({errors: "negative", tokens})
}

export const logout = async (req: Request, res: Response) => {
    try{
        const userId = String(String(req.user?.id))
        console.log(userId)
        const user = await prisma.user.findFirst({where: {id: userId}})
        if (!user){
            return res.status(404).json({errors: "user not found"})
        }
        const blackList = await new BlackListToken().blackListForUser(user)
        return res.status(200).json({detail: "successfully logged out"})
    }
    catch (err: any){
        return res.status(200).json({errors: err.message})
    }

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

export const passwordReset = async  (req: Request, res: Response) => {
    try{
        const result = passwordResetSchema.safeParse(req.body)
        if (!result.success){
            return res.status(400).json({
                        errors: Object.keys(result.error.flatten().fieldErrors).length === 0 ? result.error.flatten().formErrors
                        : result.error.flatten().fieldErrors
                    })
        }
        const email = result.data.email
        const user = await prisma.user.findFirst({where: {email: email, emailVerified: true, isActive: true}})
        if (!user){
            return res.status(404).json({errors: "user not found"})
        }
        const code = getCode()
        const otpCode = await createOtp(code, user)
        const body = getBody(code)
        const job = await taskQueue.add("email", {to: email, subject: "Password Reset", body: body})

        return res.status(200).json({detail: "password reset email sent to your email address"})
    }
    catch (err: any){
        return res.status(500).json({erros: err.message})
    }

}

export const passwordResetConfirm = async (req: Request, res: Response) => {
    const result = passwordResetConfirmSchema.safeParse(req.body)
    if (!result.success){
        return res.status(400).json({
                    errors: Object.keys(result.error.flatten().fieldErrors).length === 0 ? result.error.flatten().formErrors
                    : result.error.flatten().fieldErrors
                })
    }
    try  {
        const code = result.data.code
        const otpCode = await prisma.oneTimePassword.findFirst({where: {code: code}, include: {user: true}})
        if (!otpCode){
            return res.status(404).json({erros: "otp code is not present"})
        }
        const currentDate = new Date()
        if (currentDate > otpCode?.expiresAt){
            return res.status(400).json({errors: "code already expired"})
        }
        if (otpCode.isUsed){
            return res.status(400).json({errors: "code already used"})
        }

        const { password, confirmPassword } = result.data
        if (password !== confirmPassword){
            return res.status(400).json({errors: "password doesn't match"})
        }
        const passwrodChange = await userService.changePassword(password, otpCode.user)
        await prisma.oneTimePassword.update({where: {code: code}, data: {isUsed: true}})
        return res.status(200).json({detail: "password changed successfully"})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}
export const refreshToken = async (req: Request, res: Response) => {
    try{
        const sub = req.token
        if(!sub) return res.status(400).json({errors: "invalid user object from the decoded token"})
        
        const user = await prisma.user.findFirst({where: {id: sub, isActive: true, emailVerified: true}})
        if (!user) return res.status(404).json({errors: "User not found"})
        
        await new BlackListToken().blacklist(req.body.refreshToken)
        const tokens: Tokens = await issueTokens(user)
        return res.status(200).json({details: tokens})
    }
    catch (err: any){
        return res.status(500).json({errors: err})
    }
    
}

export const verifyEmail = async(req: Request, res: Response) => {
    try {
        const result = emailVerifySchema.safeParse(req.body)
        if(!result.success){
            return res.status(400).json({
                errors: Object.keys(result.error.flatten().fieldErrors).length === 0 ? result.error.flatten().formErrors
                : result.error.flatten().fieldErrors
            })
        }
        const code = result.data?.code
        const oneTimePassword = await prisma.oneTimePassword.findFirst({where: {code: code}, include: {user: {select: {id: true, emailVerified: true}}}})
        if (!oneTimePassword){
            return res.status(404).json({errors: "one time password is not present"})
        }
        const currentDate = new Date()
        if (currentDate > oneTimePassword.expiresAt){
            return res.status(400).json({errors: "code already expired"})
        }
        if (oneTimePassword.isUsed){
            return res.status(400).json({errors: "code already used"})
        }
        const user = oneTimePassword?.user
        if (user.emailVerified){
            return res.status(200).json({detail: "account already verified"})
        }
        const verify = await userService.verifyUser(user)
        await prisma.oneTimePassword.update({where: {id: oneTimePassword.id}, data: {isUsed: true}})

        return res.status(200).json({detail: "account verified successfully"})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
}

export const sendVerificationEmail = async(req: Request, res: Response) => {
    try{
        const result = sendVerificationSchema.safeParse(req.body)
        if(!result.success){
            return res.status(400).json({
                    errors: Object.keys(result.error.flatten().fieldErrors).length === 0 ? result.error.flatten().formErrors
                    : result.error.flatten().fieldErrors
                })
        }
        const user = await userService.getUser(result.data.email)
        if (!user){
            return res.status(404).json({errors: "User not found"})
        }
        if (user.emailVerified){
            return res.status(200).json({detail: "email already verified"})
        }
        const code = getCode()
        const otpCode = await createOtp(code, user)
        const body = getBody(code)

        const job = await taskQueue.add("email", {
            to: user.email, subject: 'OTP Verification', body: body})

        return res.status(201).json({detail: "verification email sent"})
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }

}

async function createOtp(code: string, user: User){
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)
    const otpCode = await prisma.oneTimePassword.create(
            {data: {userId: user.id, code: code, expiresAt: expiresAt}}
        )
    return otpCode
}

function getCode(){
    const codeA = []
    for (let i=1;  i<= 6; i++){
        const code = Math.floor(Math.random() * 10)
        codeA.push(code)
    }

    return codeA.join("")
}