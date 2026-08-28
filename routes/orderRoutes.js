const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require("../controllers/orderController");
const { generateInvoice } = require("../controllers/invoiceController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.get("/:id/invoice", generateInvoice);

module.exports = router;