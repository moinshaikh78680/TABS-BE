const mongoose = require("mongoose");

const UserPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
  intents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intent", // Reference to Intent model
    },
  ],
  themes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme", // Reference to Theme model
    },
  ],
});

module.exports = mongoose.model("UserPreference", UserPreferenceSchema);
