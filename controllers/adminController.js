const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  const [totalUsers, totalProducts, totalCategories, totalOrders, revenueResult] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  const recentOrders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .select("totalAmount status createdAt user")
    .lean();

  res.json({
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    totalRevenue,
    recentOrders,
  });
};

module.exports = { getDashboardStats };