

export const Jobs = Object.freeze({
    EMAIL: "email",
    FILE_UPLOAD: "file_upload"
})

export interface EmailJob {
    to: string;
    subject: string;
    body: string
}