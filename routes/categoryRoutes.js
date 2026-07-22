const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Public — anyone can browse categories
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin only — manage categories
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;