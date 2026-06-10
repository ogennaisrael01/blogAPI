import { Request, Response, NextFunction } from 'express'
// Extend Express Request to include `user` property
declare global {
    namespace Express {
        interface Request {
            user?: any,
            token?: any
        }
    }
}
import { JWTAuthentication } from '../jwt/authentication'
import { refreshTokenSchema } from '../user/validators'
import { BlackListToken } from '../jwt/tokens'
import { tokenBackend } from '../jwt/state'
import { prisma } from '../prisma-client'

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        req.user = await new JWTAuthentication().authenticateUser(req)
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }        
    next();
}

export const checkTokenBlackList = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const refreshToken = refreshTokenSchema.safeParse(req.body)
        if (!refreshToken.success){
            return res.status(400).json({
                errors: Object.keys(refreshToken.error.flatten().fieldErrors).length === 0 ? refreshToken.error.flatten().formErrors : refreshToken.error.flatten().fieldErrors})
        }
        const { jti, sub } = await tokenBackend.decodeToken(refreshToken.data.refreshToken)

        const [ isValidToken, isBlacklisted ] = await Promise.all([
            prisma.outstandingToken.findFirst({where: {jti: jti}}), new BlackListToken().checkBlacklist(jti)
        ])
        if (!isValidToken){
            return res.status(400).json({errors: "token is not recongnized"})
        }
        if (isBlacklisted){
            return res.status(400).json({errors: "invalid token sent, already blacklisted"})
        }
        req.token = sub
        next();
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }
} 