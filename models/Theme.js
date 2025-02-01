const mongoose = require("mongoose");

const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  intentId: { type: mongoose.Schema.Types.ObjectId, ref: "Intent" },
});

module.exports = mongoose.model("Theme", ThemeSchema);
