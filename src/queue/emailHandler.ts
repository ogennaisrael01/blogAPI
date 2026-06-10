import { EmailJob } from "./types";
import nodemailer from "nodemailer";
import "dotenv/config"


export async function processEmail(job: EmailJob) {
    const { to, subject, body } = job
    try{
        await sendEmail(to, subject, body)
    }
    catch (err: any){
        throw new Error(err.message)
    }
}

async function sendEmail(to: string, subject: string, body: string) {
    const transporter = await getNodemailer()
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL_FROM,
        to: to, subject: subject, html: body
    })
    
}

async function getNodemailer() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })
}