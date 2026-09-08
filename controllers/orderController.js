const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { getIO } = require("../socket");
const { sendPushNotification } = require("../firebaseAdmin");
const User = require("../models/User");
const notifySocket = require("../utils/notifySocket");
// @route GET /api/admin/orders (admin — all orders, not just their own)
const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
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

 await notifySocket(`user:${order.user}`, "orderStatusUpdate", {
  orderId: order._id,
  status: order.status,
});

  // Also send a real push notification, so the customer gets notified
  // even if they don't have the site open (WebSocket only works while it's open)
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

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
  });

  // Clear the cart after order is placed
  cart.items = [];
  await cart.save();
  const io = getIO();
io.to("admins").emit("newOrderAdmin", {
  orderId: order._id,
  customerName: req.user.name,
  total: order.totalAmount, // adjust field name to match your schema
  createdAt: order.createdAt,
});

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

// @route GET /api/admin/orders/:id (admin — can view any order regardless of owner)
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

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus ,getOrderByIdAdmin};