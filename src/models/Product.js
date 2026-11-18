import { model, Schema } from "mongoose";

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    prise: { type: String, required: true },
    images: [{ url: { type: String, required: true }, public_id: { type: String, required: true } }],
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: [{ type: String }],
    bestseller: { type: Boolean, default: false },
}, { timestamp: true })

export const Product = model("Product", productSchema)