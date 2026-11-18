import { Router } from "express";
import { addProduct, listProducts, removeProduct, singleProduct } from "../controllers/product.controller.js";
import { upload } from "../middleware/multer.js";
import { adminAuth } from "../middleware/adminAuth.js";

const productRoute = Router()

productRoute.post("/add", adminAuth, upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
    { name: "img4", maxCount: 1 },
]), addProduct)
productRoute.put("/remove/:id", adminAuth, removeProduct)
productRoute.get("/all", listProducts)
productRoute.get("/:id", singleProduct)

export default productRoute 