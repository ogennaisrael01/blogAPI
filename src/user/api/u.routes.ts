import { Router } from "express";
import { login, profilePicture, refreshToken, register, userProfile, sendVerificationEmail, verifyEmail, logout, passwordReset, passwordResetConfirm } from "../ctl/u.controller";
import { upload } from "../../blog/cloudinaryConfig";
import { checkAuth, checkTokenBlackList } from "../../middlewares/auth";

export const userRouter = Router()

/// apis
userRouter.post("/register/", register)
userRouter.post("/login/", login)
userRouter.post("/picture", upload.single("file"), checkAuth, profilePicture)
userRouter.get("/profile", checkAuth, userProfile)
userRouter.post("/rotate-token", checkTokenBlackList, refreshToken)
userRouter.post("/send-verification-email", sendVerificationEmail)
userRouter.post("/verify-email", verifyEmail)
userRouter.post("/logout", checkAuth, logout)
userRouter.post("/password-reset", passwordReset)
userRouter.post("/password-reset-confirm", passwordResetConfirm)