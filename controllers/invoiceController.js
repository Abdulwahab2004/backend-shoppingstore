const PDFDocument = require("pdfkit");
const Order = require("../models/Order");

// @route GET /api/orders/:id/invoice
const generateInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product", "name price");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Set headers so the browser treats this as a downloadable PDF file
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res); // stream the PDF directly into the response

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();

  doc.fontSize(14).text("Items", { underline: true });
  doc.moveDown(0.5);

  order.items.forEach((item) => {
    doc.fontSize(12).text(
      `${item.product?.name || "Product"}  x${item.quantity}  —  $${item.price.toFixed(2)}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: $${order.totalAmount.toFixed(2)}`, { align: "right" });

  doc.end(); // finalizes the PDF and completes the response
};

module.exports = { generateInvoice };