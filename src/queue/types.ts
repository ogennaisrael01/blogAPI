

export const Jobs = Object.freeze({
    EMAIL: "email",
    FILE_UPLOAD: "file_upload",
    NEWS_LETTER: "newsLetterEmail"
})

export interface EmailJob {
    to: string;
    subject: string;
    body: string
}

export interface newsLetterJob {
    blogPostId: string,
    authorId: string,
    emails: string[]
}