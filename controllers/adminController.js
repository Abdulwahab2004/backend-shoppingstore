const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const Category = require("../models/Category");

// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  const days = Number(req.query.days) || 7;

  const [totalUsers, totalProducts, totalCategories, totalOrders, revenueResult, revenueRaw] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  // Build a lookup of date -> total from what the DB actually returned
  const revenueMap = {};
  revenueRaw.forEach((r) => {
    revenueMap[r._id] = r.total;
  });

  // Fill in every single day in the range, defaulting to 0 if no orders that day
  const revenueByDay = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
    revenueByDay.push({
      _id: dateStr,
      total: revenueMap[dateStr] || 0,
    });
  }

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