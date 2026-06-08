import bcrypt  from "bcryptjs";
import { prisma } from "../../prisma-client";
import pkg from 'jsonwebtoken';

const { sign, verify } = pkg 

class UserService {
    private secretKey: string
    private jwtExpiryTime: string
    
    constructor () {
        this.secretKey = process.env.JWT_SECRET_KEY || "secret_key"
        this.jwtExpiryTime = process.env.JWT_EXPIRY_TIME || "7d"
    }

    async verifyToken (token: string){
        return verify( token, this.secretKey)
    }

    async getUser (email: string){
        return await prisma.user.findUnique({where: {email, isActive: true}})
    }

    async accessToken (email: string, userId: string){
        if (!this.secretKey){
            throw new Error("secret key is not present")
        }
        const token = sign({email, userId}, this.secretKey, {expiresIn: this.jwtExpiryTime, })
        return token
    }
    async setPassword (userPassword: string) {
        const saltRounds = Number(String(process.env.SALT)) || 10;
        const hashed = await bcrypt.hash(userPassword, saltRounds)
        return hashed
    }

    async checkPassword (password: string, hashedPassword: any){
        return await bcrypt.compare(password, hashedPassword)
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

} 

export const userService = new UserService()


