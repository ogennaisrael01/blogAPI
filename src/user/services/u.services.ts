import bcrypt  from "bcryptjs";
import { prisma } from "../../prisma-client";
import pkg from 'jsonwebtoken';
import { User } from "../../../generate/prisma/browser";

const { sign, verify } = pkg 

class UserService {
    private secretKey: string
    private jwtExpiryTime: string
    
    constructor () {
        this.secretKey = process.env.JWT_SECRET_KEY || "secret_key"
        this.jwtExpiryTime = process.env.JWT_EXPIRY_TIME || "7d"
    }
    async getUser (email: string){
        return await prisma.user.findUnique({where: {email, isActive: true}})
    }
    async setPassword (userPassword: string) {
        const saltRounds = Number(String(process.env.SALT)) || 10;
        const hashed = await bcrypt.hash(userPassword, saltRounds)
        return hashed
    }

    async checkPassword (password: string, hashedPassword: any){
        return await bcrypt.compare(password, hashedPassword)
    }

    async changePassword(password: string, user: User){
        const passwordHash = await this.setPassword(password)
        await prisma.user.update({
            where: {id: user.id},
            data: {password: passwordHash}
        })
    }

    async createUser (email: string, password: string, fullName: string | null) {
        const hashPassword = await this.setPassword(password)   
        if (fullName){
            fullName = fullName.toLowerCase()
        }
        const newUser = await prisma.user.create({
            data: {
                email, password: hashPassword, fullName
            }
        })
        return newUser
    }

    async verifyUser(user: any){
        try{
            await prisma.user.update({
                where: {id: user.id},
                data: {emailVerified: true, isActive: true, verifiedAt: new Date()}
            })
        }
        catch (err: any){
            throw new Error(err.message)
        }
    }


} 

export const userService = new UserService()


