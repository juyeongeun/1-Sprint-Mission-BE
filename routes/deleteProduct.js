import { Router } from "express";
import Product from "../models/product.js";
const router = Router();

// 상품 삭제 API
router.delete("/:_id", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete(req.params._id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
