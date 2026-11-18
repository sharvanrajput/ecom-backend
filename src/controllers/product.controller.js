import { uploadOnCloudinary } from "../config/cloudinary.js"
import { Product } from "../models/Product.js"


export const addProduct = async (req, res) => {
    try {
        const { name, description, prise, category, subCategory, sizes, bestseller } = req.body

        const img1 = req?.files?.img1 && req.files.img1[0]
        const img2 = req?.files?.img2 && req.files.img2[0]
        const img3 = req?.files?.img3 && req.files.img3[0]
        const img4 = req?.files?.img4 && req.files.img4[0]

        const imagegs = [img1, img2, img3, img4].filter(i => i !== undefined).map(img => img.path)

        const imgUrls = await uploadOnCloudinary(imagegs)
        const size = sizes.split(",").join(",")
        const productData = {
            name,
            description,
            prise: Number(prise),
            category,
            subCategory,
            sizes: sizes.split(",").map(s => s.trim()),
            bestseller: bestseller === "true" || bestseller === true,
            images: imgUrls
        }
        const product = await Product.create(productData)

        return res.status(201).json({ success: true, message: "User Login successfull", product })


    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong " + error })
    }
}
export const removeProduct = async (req, res) => {
    try {
        const products = await Product.findByIdAndDelete(req.params.id)

        return res.status(201).json({ success: true, message: "removed product", products })

    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong " + error })
    }
}
export const listProducts = async (req, res) => {
    try {
        const products = await Product.find()

        return res.status(201).json({ success: true, message: "All products ", products })

    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong " + error })
    }
}
export const singleProduct = async (req, res) => {
    try {
        const products = await Product.findById(req.params.id)

        return res.status(201).json({ success: true, message: "single products ", products })

    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong " + error })
    }
}