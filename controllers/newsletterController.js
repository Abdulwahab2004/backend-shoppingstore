const Newsletter = require("../models/Newsletter");

// @route POST /api/newsletter (public)
const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const exists = await Newsletter.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: "This email is already subscribed" });
  }

  await Newsletter.create({ email });
  res.status(201).json({ message: "Subscribed successfully" });
};

module.exports = { subscribe };