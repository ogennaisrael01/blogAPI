import { Request, Response, NextFunction } from 'express'
// Extend Express Request to include `user` property
declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}
import { JWTAuthentication } from '../jwt/authentication'

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        req.user = await new JWTAuthentication().authenticateUser(req)
    }
    catch (err: any){
        return res.status(500).json({errors: err.message})
    }        
    next();
}