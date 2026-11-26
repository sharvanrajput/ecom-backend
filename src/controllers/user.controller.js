import { genToken } from "../config/db.js"
import { User } from "../models/User.js"
import bcrypt from "bcryptjs"
const option = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24
}

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body ?? {}

        if ([name, email, password].some(field => typeof field !== "string" || !field.trim())) {
            return res.status(400).json({ success: false, message: "all fields are required" })
        }

        const normalizedEmail = email.trim().toLowerCase()
        const existing = await User.findOne({ email: normalizedEmail })

        if (existing) {
            return res.status(400).json({ success: false, message: "user already exist" })
        }

        const user = await User.create({ name: name.trim(), email: normalizedEmail, password })

        const token = genToken(user._id)

        return res.cookie("token", token, option).status(201).json({ success: true, message: "User Register successfull", token })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "user already exist" })
        }
        console.error("User signup failed:", error)
        return res.status(500).json({ success: false, message: "Unable to create account" })
    }
}

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body ?? {}

        if ([email, password].some(field => typeof field !== "string" || !field.trim())) {
            return res.status(400).json({ success: false, message: "all fields are required" })
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() })

        if (!user) {
            return res.status(400).json({ success: false, message: "Incorrect email or password" })
        }

        const isCorrect = await bcrypt.compare(password, user.password)

        if (!isCorrect) {
            return res.status(400).json({ success: false, message: "Incorrect email or password" })
        }

        const token = genToken(user._id)

        return res.cookie("token", token, option).status(200).json({ success: true, message: "User Login successfull", token })

    } catch (error) {
        console.error("User signin failed:", error)
        return res.status(500).json({ success: false, message: "Unable to sign in" })
    }
}

export const signout = async (req, res) => {
    try {
        return res.clearCookie("token", option).status(200).json({ success: true, message: "User Logout successfull" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong " + error })
    }
}

export const adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body

        const aemail = process.env.ADMIN_EMAIL
        const apass = process.env.ADMIN_PASS

        if (email !== aemail || password !== apass) {
            return res.status(400).json({ success: false, message: "Incorrect email or password" })
        }

        const token = genToken(email)
                        
        return res.cookie("token", token, option).status(200).json({ success: true, message: "Admin Login successfull", token })

    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong " + error })
    }
}
export const google = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong " + error })
    }
}