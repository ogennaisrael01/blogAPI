import { uuid } from "zod";
import { tokenBackend } from "./state";
import { OutstandingToken, User } from "../../generate/prisma/browser";
import { userPaylaod } from "./types";
import { prisma } from "../prisma-client";

class Token {
    tokenType: string;
    lifetime: string;

    constructor (tokenType: string, lifetime: string){
        this.tokenType = tokenType
        this.lifetime = lifetime
    
    }
    set_jti(){
        return crypto.randomUUID()
    }

    set_exp(){
        return this.lifetime
    }

    async forUser(user: User){
        const isActive = user?.isActive
        if(!isActive){
            throw new Error("Cannot issue a token to inactive user")
        }
        const paylaod: userPaylaod= {
            userId: user?.id, email: user?.email, jti: this.set_jti(), exp: this.set_exp(),
            tokenType: this.tokenType
        }
        const token = await tokenBackend.encodeToken(paylaod)

        if (this.tokenType === "refreshToken"){
            new BlackListToken().outstand(token)
        }
        return token
    }
}

export class AccessToken extends Token {

    constructor (tokenType: string, lifetime: string){
        super(tokenType, lifetime)
    }
}

export class RefreshToken extends Token {
    constructor (tokenType: string, lifetime: string){
        super(tokenType, lifetime)
    }
}

export class BlackListToken {
    constructor(){}

    async outstand(token: string){
        const decode = await tokenBackend.decodeToken(token)
        const jti = decode?.jti
        const exp = decode?.exp
        await prisma.outstandingToken.create({
            data: {userId: decode?.userId, jti: jti, expiresAt: new Date(exp * 1000) , token: token}
        })
        return token
    }

    async checkBlacklist(jti: string){
        const blacklist = await prisma.blacklistedToken.findFirst({
            where: { token: { jti: jti}}
        })
        const isBlacklisted = blacklist ? true : false
        return isBlacklisted
    }

    async blacklist (token: string){
        const decode = await tokenBackend.decodeToken(token)
        const { jti, exp, userId} = decode
        const user = await prisma.user.findUnique({where: { id: userId}})
        if (!user){
            return null
        }
        const outstandingToken = await prisma.outstandingToken.findFirst({
            where: { jti: jti, expiresAt: new Date(exp * 1000)}
        })

        if (!outstandingToken) {
            return null
        }

        return await prisma.blacklistedToken.create({
            data: {tokenId: outstandingToken.id}
        })
    }

    async blackListForUser(user: User){
        const outstandingTokens = await prisma.outstandingToken.findMany({where: {userId: user.id}})
        try{
            const blackList = outstandingTokens.map(async (token) => {
                const isBlackListed = token.token ? await prisma.blacklistedToken.create({data: { tokenId: token.id}}) : false
                return isBlackListed
            })
        }
        catch (err: any){
            throw new Error(err.message)
        }
    }
}

export const issueTokens = async (user: User) => {
    const accessToken = await new AccessToken("accessToken", "60m").forUser(user)
    const refreshToken = await new RefreshToken("refreshToken", "10d").forUser(user)
    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenType: "Bearer"
    }
}