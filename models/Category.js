const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
categorySchema.index({ slug: 1 });
module.exports = mongoose.model("Category", categorySchema);