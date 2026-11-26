import jwt from "jsonwebtoken"

export const adminAuth = async (req, res, next) => {
    try {

        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorizsed request" })
        }

        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
  
        if (decode.id !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        next()

    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" })
    }
}
