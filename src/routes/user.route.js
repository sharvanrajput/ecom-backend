import { Router } from "express"
import { adminLogin, google, signin, signout, signup } from "../controllers/user.controller.js"
import { adminAuth } from "../middleware/adminAuth.js"

const userRoute = Router()

userRoute.post("/signup", signup)
userRoute.post("/signin", signin)
userRoute.post("/signout", signout)
userRoute.post("/adminlogin", adminLogin)
userRoute.get("/admin/verify", adminAuth, (req, res) => {
    return res.status(200).json({ success: true })
})
userRoute.post("/google", google)

export default userRoute