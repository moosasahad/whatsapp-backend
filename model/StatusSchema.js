const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text","image", "video"],
      required: true,
    },
    content: {
      type: String, 
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 24 * 60 * 60 * 1000, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Status", statusSchema);
