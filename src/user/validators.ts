import * as z from "zod";

export const userSchema = z.object({
    email: z.email().trim().nonempty(),
    password: z.string().nonempty().min(8, "Password too short"),
    fullName: z.string().nullable()
})

export const loginSchema = z.object({
    email: z.email().nonempty().trim(),
    password: z.string().nonempty().min(8, 'password too short')
})