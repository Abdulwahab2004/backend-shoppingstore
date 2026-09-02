const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminController");
const { getUsers, updateUserRole, deleteUser } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");

router.use(protect, admin);

router.get("/stats", getDashboardStats);

router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;