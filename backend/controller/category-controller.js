const Category = require("../models/category");
const { isValidObjectId } = require("mongoose");

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).send({ error: "Category already exists" });
    }

    const category = new Category(req.body);
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.send(categories);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.send(category);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const editCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const category = await Category.findByIdAndUpdate(id, { name });
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    await category.save();
    res.send({ message: "Category edited successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }
    res.json({ message: "category deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  editCategory,
  deleteCategory,
};
