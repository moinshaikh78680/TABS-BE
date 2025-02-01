const mongoose = require("mongoose");

const IntentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model("Intent", IntentSchema);
