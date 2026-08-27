const Stripe = require("stripe");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// @route POST /api/payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
      },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US", "PK", "GB", "CA"],
    },
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-failure`,
    metadata: {
      userId: req.user._id.toString(),
    },
  });

  res.json({ url: session.url });
};

// @route POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (cart && cart.items.length > 0) {
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await Order.create({
        user: userId,
        items: orderItems,
        totalAmount,
        status: "processing",
        stripeSessionId: session.id,
      });

      cart.items = [];
      await cart.save();
    }
  }

  res.json({ received: true });
};

module.exports = { createCheckoutSession, handleWebhook };