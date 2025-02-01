const mongoose = require("mongoose");

const capsuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slides: [
    {
      type: {
        type: String, // The type of content in the slide
        enum: ["text"],
        required: true,
      },
      content: {
        type: String, // Actual content for the slide
        required: true,
      },
    },
  ],
  intent: [
    {
      type: String,
      required: true,
    },
  ],
  theme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theme",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  set: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Set",
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  metadata: {
    author: {
      type: String,
      default: "Unknown",
    },
    estimatedReadTime: {
      type: Number, // In minutes
    },
    saveCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  questionOrPoll: {
    type: {
      type: String, // Specifies whether it's a question or a poll
      enum: ["question", "poll"],
      required: true,
    },
    content: {
      type: String, // Common field for both question text or poll context
      required: true,
    },
    pollOptions: {
      type: [
        {
          optionText: { type: String, required: true }, // Poll option text
          votes: { type: Number, default: 0 }, // Vote count for this option
        },
      ],
      validate: {
        validator: function (value) {
          return this.type === "poll" ? value && value.length >= 2 : true;
        },
        message: "Poll must have at least 2 options.",
      },
    },
  },
  wikiIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wiki" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Capsule", capsuleSchema);
