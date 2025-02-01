const mongoose = require("mongoose");

const userInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  capsuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Capsule",
    required: true,
  },
  // setId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Set",
  //   required: true, // To identify the set this capsule belongs to
  // },
  completed: {
    type: Boolean,
    default: false, // Whether the user completed the capsule
  },
  questionAnswer: {
    type: String, // Stores the user's answer to the capsule's question
  },
  pollResponse: {
    type: String, // Stores the poll option chosen by the user
  },
  completedAt: {
    type: Date, // Timestamp of when the capsule was completed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserInteraction", userInteractionSchema);
