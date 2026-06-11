import { EmailJob, newsLetterJob } from "./types";
import nodemailer from "nodemailer";
import "dotenv/config"
import { prisma } from "../prisma-client";
import { email } from "zod";
import { getnewsLetterBody } from "./template";
import { taskQueue } from "./queue";
import { ca } from "zod/v4/locales";


export async function processEmail(job: EmailJob) {
    const { to, subject, body } = job
    try{
        await sendEmail(to, subject, body)
    }
    catch (err: any){
        throw new Error(err.message)
    }
}

export async function processNewsLetterEmail(job : newsLetterJob) {
    try{
        const [author, blog] = await Promise.all([
            prisma.user.findFirst({where: { id: job.authorId}, select: {fullName: true}}),
            prisma.blog.findFirst({where: { id: job.blogPostId}, select: {title: true}})
        ])
        if (!author || !blog){
            throw new Error("Invalid Job Data: Author or Blog Post not found.")
        }
        const emails = job.emails
        const blogURL = `${process.env.BASE_URL}/api/blog/${job.blogPostId}`
        const unsubscribe = `${process.env.BASE_URL}/api/${job.authorId}/unsubscribe`
       
        const processJob = emails.forEach( async (email, index) => {
            const body = getnewsLetterBody(
                blogURL, author.fullName??"", blog?.title, email, unsubscribe
            )
            await taskQueue.add("email", {to: email, subject: `New Blog Post From ${author.fullName}`, body})

        })
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