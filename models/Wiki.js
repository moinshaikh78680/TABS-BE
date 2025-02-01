const mongoose = require("mongoose");

const wikiSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    definition: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["technology", "business", "entertainment", "general"],
      default: "general",
    },
  },
  { timestamps: true }
);

const Wiki = mongoose.model("Wiki", wikiSchema);

module.exports = Wiki;
