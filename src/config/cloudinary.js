import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadOnCloudinary = async (imgs) => {
    const cloudimgs = []

    const cloudPromises = imgs.map(img => cloudinary.uploader.upload(img))

    const res = await Promise.all(cloudPromises)

    const data = res.map((ele) => ({ url: ele.secure_url, public_id: ele.public_id }))
 
    return data
}
