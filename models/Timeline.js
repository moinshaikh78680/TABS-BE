const mongoose = require("mongoose");

const TimelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name of the timeline (e.g., "Learn MySQL")
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // The user who owns this timeline
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true, // The subject this timeline is linked to
  },
  tasks: [
    {
      set: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Set",
        required: true, // The set linked to the task
      },
      completed: {
        type: Boolean,
        default: false, // Whether the task is completed or not
      },
      addedAt: {
        type: Date,
        default: Date.now, // When this set was added to the timeline
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // When the timeline was created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // When the timeline was last updated
  },
});

module.exports = mongoose.model("Timeline", TimelineSchema);
