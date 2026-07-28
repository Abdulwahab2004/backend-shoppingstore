const Cart = require("../models/Cart");

// @route GET /api/cart
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json(cart);
};

// @route POST /api/cart (add item)
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
};

// @route PUT /api/cart/:productId (update quantity)
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item = cart.items.find(
    (item) => item.product.toString() === req.params.productId
  );

  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
};

// @route DELETE /api/cart/:productId (remove item)
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };