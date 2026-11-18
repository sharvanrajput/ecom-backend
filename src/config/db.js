import mongoose from "mongoose"
import jwt from "jsonwebtoken"

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("db connected")
    } catch (error) {
        console.log("db not connected")
    }
}

export const genToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" })
}
