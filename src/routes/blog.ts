import { Router, Request, Response } from "express";
import { create, listPost, retreiveBlog, updateBlog, destroyBlog } from "../controllers/blogControllers";
export const blogRouter = Router();

const healthCheck = async (req: Request, res: Response) => {
    return res.status(200).json({ status: true, details: "Blog api handler running with no errors" });
};

blogRouter.get("/health", healthCheck);
blogRouter.post("/blog", create)
blogRouter.get("/blog", listPost)
blogRouter.get("/blog/:blogId", retreiveBlog)
blogRouter.patch("/blog/:blogId", updateBlog)
blogRouter.delete("/blog/:blogId", destroyBlog)