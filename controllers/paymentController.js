const Stripe = require("stripe");
const Cart = require("../models/Cart");

// @route POST /api/payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
  // Stripe needs to be created fresh here (not at file top) so it always
  // reads the latest env var — same lesson we learned with nodemailer earlier
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Stripe wants each cart item described as a "line item" —
  // name, price (in cents), and quantity
  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
      },
      unit_amount: Math.round(item.product.price * 100), // Stripe uses cents, not dollars
    },
    quantity: item.quantity,
  }));

  // This creates a hosted Stripe payment page and gives us a URL to redirect the user to
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-failure`,
    metadata: {
      userId: req.user._id.toString(),
    },
  });

  res.json({ url: session.url });
};

module.exports = { createCheckoutSession };