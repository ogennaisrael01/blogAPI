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

export const refreshTokenSchema = z.object({
    refreshToken: z.string().nonempty()
})

export const emailVerifySchema = z.object({
    code: z.string().max(6).min(6)
})

export const sendVerificationSchema = z.object({
    email: z.string().nonempty().min(5, "Email cannot be less than 5 characters")
})

export const passwordResetSchema = z.object({
    email: z.string().nonempty().min(5)
})

export const passwordResetConfirmSchema = z.object({
    code: z.string().nonempty().min(6).max(6),
    password: z.string().nonempty().min(8),
    confirmPassword: z.string().nonempty().min(8)
})

export function getBody(code: string) {
    const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; color: #1f2937;">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome to our platform!</h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
        Thank you for registering an account with us. We are excited to have you on board!
        </p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">
        Please use the verification code below to confirm your email address and activate your account:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; background-color: #eff6ff; padding: 12px 30px; border-radius: 6px; border: 1px dashed #bfdbfe; display: inline-block;">
            ${code}
        </span>
        </div>
        
        <p style="font-size: 14px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        If you did not request this code, you can safely ignore this email.
        </p>
    </div>
    `;

    return htmlBody
}