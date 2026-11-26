import { model,   Schema } from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userCart: { type: Object, default: {} },
}, { timestamps: true, minimize: false })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

export const User =   model("User", userSchema)