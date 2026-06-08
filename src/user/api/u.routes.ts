import { Router } from "express";
import { login, profilePicture, register, userProfile } from "../ctl/u.controller";
import { upload } from "../../blog/cloudinaryConfig";
import { checkAuth } from "../../middlewares/auth";

export const userRouter = Router()

/// apis
userRouter.post("/register/", register)
userRouter.post("/login/", login)
userRouter.post("/picture", upload.single("file"), checkAuth, profilePicture)
userRouter.get("/profile", checkAuth, userProfile)