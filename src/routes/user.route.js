import { Router } from "express"
import { adminLogin, google, signin, signout, signup } from "../controllers/user.controller.js"

const userRoute = Router()

userRoute.post("/signup", signup)
userRoute.post("/signin", signin)
userRoute.post("/signout", signout)
userRoute.post("/adminlogin", adminLogin)
userRoute.post("/google", google)

export default userRoute