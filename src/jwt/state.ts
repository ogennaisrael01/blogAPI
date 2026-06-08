import { TokenBackend } from "./tokenBackend";
import 'dotenv/config'
import { Algorithm } from "jsonwebtoken";


export const tokenBackend  = new TokenBackend(
    process.env.JWT_SECRET_KEY as string,
    process.env.JWT_ALGORITHM as Algorithm,
    process.env.JWT_AUDIENCE as string,
    process.env.JWT_ISSUER as string,
    process.env.EXPIRES_AT as string
)