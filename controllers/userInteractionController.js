const UserInteraction = require("../models/UserInteraction");
const Timeline = require("../models/Timeline");
const Capsule = require("../models/Capsule");

exports.submitInteraction = async (req, res) => {
  try {
    const { userId, capsuleId, type, response } = req.body;

    console.log("body", userId, capsuleId, type, response);

    // Validate inputs
    if (!userId || !capsuleId || !type || !response) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    // Fetch the capsule to get the associated setId
    const capsule = await Capsule.findById(capsuleId);
    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: "Capsule not found.",
      });
    }

    const setId = capsule.set; // Retrieve setId from the capsule
    console.log("setId", setId);

    // Step 1: Check or create/update user interaction
    let interaction = await UserInteraction.findOne({ userId, capsuleId });

    if (!interaction) {
      // Create a new interaction if none exists
      interaction = new UserInteraction({
        userId,
        capsuleId,
        completed: true,
        completedAt: new Date(),
        questionAnswer: type === "question" ? response : undefined,
        pollResponse: type === "poll" ? response : undefined,
      });
    } else {
      // Update the existing interaction
      interaction.completed = true;
      interaction.completedAt = new Date();
      if (type === "question") {
        interaction.questionAnswer = response;
      } else if (type === "poll") {
        interaction.pollResponse = response;
      }
    }

    // Save the interaction
    await interaction.save();

    // Step 2: Update the timeline for the user and set
    const timeline = await Timeline.findOne({
      user: userId,
      "tasks.set": setId,
    });

    if (!timeline) {
      console.error("Timeline not found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "Timeline not found for this user.",
      });
    }

    const taskIndex = timeline.tasks.findIndex(
      (task) => task.set.toString() === setId.toString()
    );

    if (taskIndex !== -1) {
      console.log("Updating timeline task at index:", taskIndex);
      timeline.tasks[taskIndex].completed = true;
      timeline.tasks[taskIndex].updatedAt = new Date(); // Ensure the task has the correct updatedAt field
    } else {
      console.error("Set not found in timeline for setId:", setId);
      return res.status(404).json({
        success: false,
        message: "Set not found in user's timeline.",
      });
    }

    // Save the updated timeline
    await timeline.save();
    console.log("Timeline updated successfully:", timeline);

    res.status(200).json({
      success: true,
      message: "Interaction recorded and timeline updated successfully.",
      data: {
        interaction,
        timeline,
      },
    });
  } catch (error) {
    console.error("Error submitting interaction:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while submitting interaction.",
      error: error.message,
    });
  }
};
