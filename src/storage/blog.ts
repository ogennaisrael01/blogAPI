import { Blog } from "../types/blogTypes";
import { Comment } from "../types/commentTypes";

export const BlogStorage: Blog[] = [{
    title: "title",
    author: {email: "testuser@gmail.com", name: "test"},
    id: 3,
    date_published: new Date(),
    date_updated: new Date(),
    description: "description"
}]

export const commentStorage: Comment[] = [{
    message: "comment message",
    blogId: 3,
    author: {email: "commentemail@gmail.com", name: "commenter"},
    commentId: 2,
    createdAt: new Date(),
    updatedAt: new Date()
}]