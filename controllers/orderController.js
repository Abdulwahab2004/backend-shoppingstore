const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const notifySocket = require("../utils/notifySocket");
const { sendPushNotification } = require("../firebaseAdmin");

// @route POST /api/orders
const createOrder = async (req, res) => {
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
  });

  cart.items = [];
  await cart.save();

  res.status(201).json(order);
};

// @route GET /api/orders (logged-in user's own orders)
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product", "name images")
    .lean();

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  res.json(order);
};

// @route GET /api/admin/orders (admin — all orders)
const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
};

// @route GET /api/admin/orders/:id (admin — view any order)
const getOrderByIdAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name images price")
    .lean();

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};

// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  // Notify the customer in real time, via the separate socket server
  await notifySocket(`user:${order.user}`, "orderStatusUpdate", {
    orderId: order._id,
    status: order.status,
  });

  // Also send a real push notification, reaches them even if the tab is closed
  const customer = await User.findById(order.user).select("fcmToken");
  if (customer?.fcmToken) {
    await sendPushNotification(
      customer.fcmToken,
      "Order Update",
      `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status}`
    );
  }

  res.json(order);
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
};