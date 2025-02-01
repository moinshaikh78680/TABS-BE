const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { type: String, enum: ["text", "image", "video"], required: true },
  capsule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Capsule",
    required: true,
  },
});

module.exports = mongoose.model("Slide", SlideSchema);
