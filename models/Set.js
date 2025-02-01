const mongoose = require("mongoose");

const SetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  benefits: {
    type: [String], // List of benefits users will gain from completing this set
    required: true,
  },
  recommendedOrder: {
    type: Number, // Recommended position of this set in the timeline
    default: 0,
  },
});

module.exports = mongoose.model("Set", SetSchema);
