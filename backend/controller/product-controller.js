const Product = require("../models/product");
const Category = require("../models/category");
const { isValidObjectId } = require("mongoose");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const addProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const { thumbnail, images } = req.files;

  const existingCategory = await Category.findOne({ name: category });
  if (!existingCategory) {
    return res.status(400).send({ error: "Category does not exist" });
  }

  const newProduct = new Product({
    name,
    description,
    price,
    category: existingCategory._id,
    stock,
  });
  if (thumbnail && thumbnail.length > 0) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      thumbnail[0].path,
      { gravity: "face", height: 500, width: 500, crop: "thumb" }
    );
    newProduct.thumbnail = { url: secure_url, public_id };
  }

  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        images[i].path
      );
      newProduct.images.push({ url: secure_url, public_id });
    }
  }
  try {
    await newProduct.save();
    res.status(201).json({ newProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock } = req.body;
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    if (category) {
      const existingCategory = await Category.findOne({ name: category });
      if (!existingCategory) {
        return res.status(400).send({ error: "Category does not exist" });
      }
      product.category = existingCategory._id;
    }
    product.stock = stock || product.stock;

    if (req.files) {
      const { thumbnail, images } = req.files;

      if (thumbnail && thumbnail.length > 0) {
        if (product.thumbnail.public_id) {
          await cloudinary.uploader.destroy(product.thumbnail.public_id);
        }
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          thumbnail[0].path,
          { gravity: "face", height: 500, width: 500, crop: "thumb" }
        );
        product.thumbnail = { url: secure_url, public_id };
      }

      if (images && images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          await cloudinary.uploader.destroy(product.images[i].public_id);
        }
        product.images = [];
        for (let i = 0; i < images.length; i++) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            images[i].path
          );
          product.images.push({ url: secure_url, public_id });
        }
      }
    }

    await product.save();
    res.status(200).json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.thumbnail.public_id) {
      await cloudinary.uploader.destroy(product.thumbnail.public_id);
    }

    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
};
