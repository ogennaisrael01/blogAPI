import { Verify } from "node:crypto";
import { AllowedAlgorithms } from "./types";
import { sign, SignOptions, verify, VerifyOptions, TokenExpiredError, JsonWebTokenError, Algorithm } from "jsonwebtoken";
import { REPLCommand } from "node:repl";

export class TokenBackend {

    secretKey: string;
    algorithm: Algorithm;
    audience: string | undefined;
    issuer: string | undefined;
    expiryAt: string;

    constructor (
        secretKey: string, algorithm: Algorithm, audience: string | undefined, issuer: string | undefined, expiryAt: string
    ){
        this.validate_algorithm(algorithm)
        if (!expiryAt){
            expiryAt = "7d"
        }

        this.secretKey = secretKey;
        this.algorithm = algorithm;
        this.audience = audience;
        this.issuer = issuer;
        this.expiryAt = expiryAt

    }

    validate_algorithm(algorithm: string){
        const isValid = algorithm in AllowedAlgorithms
        if (!isValid){
            throw new Error("Algorithm is not recongnized")
        }

    }
    async encodeToken(payload: Record<string, any>){
        const jti = payload?.jti
        const exp = payload?.exp
        if (exp){
            this.expiryAt = exp
        } 
        delete payload.exp
        delete payload.jti
        const token = sign(
            payload,
            this.secretKey,
            {
                expiresIn: this.expiryAt,
                audience: this.audience,
                subject: payload?.userId,
                issuer: this.issuer,
                algorithm: this.algorithm,
                jwtid: jti,
            } as SignOptions,
        )
 
        return token
    }

    async decodeToken(token: string){
        try{
            return verify(token, this.secretKey, 
                {algorithms: [this.algorithm], issuer: this.issuer, audience: this.audience} as VerifyOptions
            ) as Record<string, any>

        }
        catch (err: any){  
            if (err instanceof JsonWebTokenError){
                throw new Error(`JSONWeb token errror: ${err.message}`)
            }
            else if(err instanceof TokenExpiredError ){
                throw new Error (`Token Expired Error ${err.message}`)
            }
            else {
                throw new Error(`JWT Error: ${err.message}`)
            }
        }

    }

}
