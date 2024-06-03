const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} = require("../controller/product-controller");
const { productInfoValidator, validate } = require("../middlewares/validator");
const { uploadImage } = require("../middlewares/multer");

router.post(
  "/add",
  uploadImage.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  productInfoValidator,
  validate,
  addProduct
);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put(
  "/update/:id",
  uploadImage.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  productInfoValidator,
  validate,
  updateProduct
);
router.delete("/delete/:id", deleteProduct);

module.exports = router;
