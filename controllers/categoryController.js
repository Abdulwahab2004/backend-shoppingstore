const Category = require("../models/Category");


// @route POST /api/categories (admin only)
const createCategory = async (req, res) => {
  const { name, image } = req.body;

  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  const exists = await Category.findOne({ slug });
  if (exists) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await Category.create({ name, slug, image });
  res.status(201).json(category);
};

// @route GET /api/categories (public)
const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

// @route GET /api/categories/:id (public)
const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category);
};

// @route PUT /api/categories/:id (admin only)
const updateCategory = async (req, res) => {
  const { name, image } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.name = name || category.name;
  category.slug = name ? name.toLowerCase().trim().replace(/\s+/g, "-") : category.slug;
  category.image = image ?? category.image;

  await category.save();
  res.json(category);
};

// @route DELETE /api/categories/:id (admin only)
const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  await category.deleteOne();
  res.json({ message: "Category deleted" });
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};