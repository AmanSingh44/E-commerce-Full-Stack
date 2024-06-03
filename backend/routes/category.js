const express = require("express");
const {
  createCategory,
  getAllCategory,
  getCategoryById,
  deleteCategory,
  editCategory,
} = require("../controller/category-controller");
const router = express.Router();

router.post("/create", createCategory);
router.get("/", getAllCategory);
router.get("/:id", getCategoryById);
router.put("/edit/:id", editCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
