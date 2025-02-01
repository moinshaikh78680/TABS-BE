const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    privacy: { type: String, enum: ["personal", "public"], required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    capsules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Capsule" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Folder", folderSchema);
