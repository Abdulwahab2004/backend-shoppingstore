const Contact = require("../models/Contact");
const { sendContactNotification } = require("../services/emailService");
const { getIO } = require("../socket");

// @route POST /api/contact
const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const contact = await Contact.create({ name, email, subject, message });

  // Notify admins in real time (reuses your existing admin room)
  const io = getIO();
  io.to("admins").emit("newContactMessage", {
    id: contact._id,
    name: contact.name,
    subject: contact.subject,
    createdAt: contact.createdAt,
  });

  // Fire-and-forget email alert — don't block the response on it
  sendContactNotification(contact).catch((err) =>
    console.error("Failed to send contact notification email:", err)
  );

  res.status(201).json({ message: "Your message has been received. We'll get back to you soon." });
};

// @route GET /api/admin/contact
const getAllContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
};

// @route PUT /api/admin/contact/:id/status
const updateContactStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["new", "read", "resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!contact) return res.status(404).json({ message: "Message not found" });
  res.json(contact);
};

module.exports = { submitContact, getAllContacts, updateContactStatus };