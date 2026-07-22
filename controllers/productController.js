const Product = require("../models/Product");

// @route POST /api/products (admin only)
const createProduct = async (req, res) => {
  const { name, description, price, stock, category, images } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    images: images || [],
  });

  res.status(201).json(product);
};

// @route GET /api/products (public) — supports search, filter, pagination
const getProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  res.json({
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
};

// @route GET /api/products/:id (public)
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

// @route PUT /api/products/:id (admin only)
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, description, price, stock, category, images } = req.body;

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.stock = stock ?? product.stock;
  product.category = category ?? product.category;
  product.images = images ?? product.images;

  await product.save();
  res.json(product);
};

// @route DELETE /api/products/:id (admin only)
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await product.deleteOne();
  res.json({ message: "Product deleted" });
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};