const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const Category = require("../models/Category");

// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  const [totalUsers, totalProducts, totalCategories, totalOrders, revenueResult, revenueByDay] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Groups revenue by day for the last 7 days — powers the analytics chart
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
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
    revenueByDay,
  });
};

module.exports = { getDashboardStats };