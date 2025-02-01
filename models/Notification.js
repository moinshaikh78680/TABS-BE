const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Object, // Any additional data associated with the notification
      default: {},
    },
    read: {
      type: Boolean,
      default: false, // Default is unread
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the creation time
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
