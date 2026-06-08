import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import "dotenv/config";

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.memoryStorage();
export const upload = multer({storage: storage})

export const cloudinaryUpload = async (file: string) => {
    const result = await cloudinary.uploader.upload(file, {
        folder: "blog_assets", resource_type: "auto"
    })

    return result
}

