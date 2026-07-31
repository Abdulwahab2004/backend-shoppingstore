const Wishlist = require("../models/Wishlist");

// @route GET /api/wishlist
const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate("products", "name price images")
    .lean();

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    wishlist = wishlist.toObject();
  }

  res.json(wishlist);
};

// @route POST /api/wishlist (add product)
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const alreadyExists = wishlist.products.some(
    (id) => id.toString() === productId
  );

  if (!alreadyExists) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  await wishlist.populate("products", "name price images");
  res.json(wishlist);
};

// @route DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return res.status(404).json({ message: "Wishlist not found" });
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== req.params.productId
  );

  await wishlist.save();
  await wishlist.populate("products", "name price images");
  res.json(wishlist);
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };