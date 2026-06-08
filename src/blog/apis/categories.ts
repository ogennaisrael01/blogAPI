import { Router } from "express";
import { checkAuth } from "../../middlewares/auth";
import { userRole } from "../../middlewares/permissions";
import { addCategory, addTags, listCategories, listTags, retrieveCategory, retrieveTag } from "../controllers/category";

export const router = Router();
export const isAdmin = userRole("admin")

router.post("/categories", checkAuth, isAdmin, addCategory)
router.get("/categories", checkAuth, listCategories)
router.get("/category/:slug", checkAuth, retrieveCategory)

router.post("/tags", checkAuth, isAdmin, addTags)
router.get("/tags", checkAuth, listTags)
router.get("/tags/:slug", checkAuth, retrieveTag)