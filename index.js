import express from "express"
import dotenv from "dotenv"
dotenv.config()
import userRoute from "./src/routes/user.route.js"
import cookieParser from "cookie-parser"
import { connectDb } from "./src/config/db.js"
import productRoute from "./src/routes/product.route.js"
import cors from "cors"
const app = express()
const port = 4000
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.use("/api/user", userRoute)
app.use("/api/product", productRoute)


connectDb().then(() => {
    app.listen(port, () => {
        console.log(`app is running`)
    })
})
