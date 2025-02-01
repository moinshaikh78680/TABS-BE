const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  theme: { type: mongoose.Schema.Types.ObjectId, ref: "Theme", required: true },
  defaultTimeline: [
    {
      name: { type: String, required: true }, // Name of the timeline (e.g., "Learn React Native")
      tasks: [
        {
          set: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Set", // Reference to the Set model
            required: true,
          },
          recommendedOrder: { type: Number }, // Order in the timeline
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Subject", SubjectSchema);
