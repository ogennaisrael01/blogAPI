import express, {Request, Response} from "express";
import { addComment, listComentUnderPost } from "../controllers/commentControllers";


export const commentRouter = express.Router();

commentRouter.get("/comment/health", (req: Request, res: Response) => {
    return res.status(200).json({status: true, details: "comment router fetched with no errors"})
})  

commentRouter.post("/blog/:blogId/comments", addComment)
commentRouter.get("/blog/:blogId/comments", listComentUnderPost)