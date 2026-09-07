const Contact = require("../models/Contact");

// @route POST /api/contact (public)
const submitContact = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  await Contact.create({ name, email, message });
  res.status(201).json({ message: "Message sent successfully" });
};

// @route GET /api/admin/contacts (admin)
const getContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
  res.json(contacts);
};

module.exports = { submitContact, getContacts };