const User = require("../models/User");

// @route GET /api/admin/users
const getUsers = async (req, res) => {
  const users = await User.find()
    .select("name email role isVerified createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json(users);
};

// @route PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent an admin from accidentally demoting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot change your own role" });
  }

  user.role = role;
  await user.save();

  res.json({ message: "User role updated", user: { id: user._id, role: user.role } });
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
};

module.exports = { getUsers, updateUserRole, deleteUser };