const Capsule = require("../models/Capsule");
const UserPreference = require("../models/UserPreference");
const User = require("../models/User");
const Wiki = require("../models/Wiki"); // Import Wiki model
const {
  createNotificationMessages,
} = require("../services/createNotificationMessages");
const { sendPushNotifications } = require("../services/notificationService");

exports.createCapsule = async (req, res) => {
  try {
    const {
      title,
      slides,
      intent,
      theme,
      subject,
      set,
      tags,
      metadata,
      questionOrPoll,
      wikiIds, // New field in the payload
    } = req.body;

    // Validation for required fields
    if (
      !title ||
      !slides ||
      !intent ||
      !theme ||
      !subject ||
      !set ||
      !questionOrPoll
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Ensure all necessary data is provided.",
      });
    }

    // Validate slides
    if (!Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Slides must be a non-empty array.",
      });
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.type !== "text") {
        return res.status(400).json({
          success: false,
          message: `Invalid slide type at index ${i}. Only 'text' is allowed.`,
        });
      }
      if (!slide.content) {
        return res.status(400).json({
          success: false,
          message: `Slide content is required at index ${i}.`,
        });
      }
    }

    // Validate `questionOrPoll`
    if (!["question", "poll"].includes(questionOrPoll.type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid type for questionOrPoll. Must be 'question' or 'poll'.",
      });
    }

    if (!questionOrPoll.content) {
      return res.status(400).json({
        success: false,
        message: "The content field is required for questionOrPoll.",
      });
    }

    if (questionOrPoll.type === "poll") {
      if (
        !Array.isArray(questionOrPoll.pollOptions) ||
        questionOrPoll.pollOptions.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Poll must have at least 2 options.",
        });
      }

      for (let i = 0; i < questionOrPoll.pollOptions.length; i++) {
        const option = questionOrPoll.pollOptions[i];
        if (!option.optionText) {
          return res.status(400).json({
            success: false,
            message: `Option text is required for poll option at index ${i}.`,
          });
        }
      }
    }

    // Validate `wikiIds`
    if (wikiIds && !Array.isArray(wikiIds)) {
      return res.status(400).json({
        success: false,
        message: "wikiIds must be an array of valid Wiki IDs.",
      });
    }

    // Check if all `wikiIds` exist in the Wiki collection
    const validWikiIds = await Wiki.find({ _id: { $in: wikiIds } }).select(
      "_id"
    );
    const validWikiIdSet = new Set(
      validWikiIds.map((wiki) => wiki._id.toString())
    );

    const invalidWikiIds = wikiIds.filter(
      (id) => !validWikiIdSet.has(id.toString())
    );

    if (invalidWikiIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some Wiki IDs are invalid: ${invalidWikiIds.join(", ")}`,
      });
    }

    // Create the capsule
    const capsule = new Capsule({
      title,
      slides,
      intent,
      theme,
      subject,
      set,
      tags,
      metadata,
      questionOrPoll,
      wikiIds, // Associate the provided Wiki IDs
    });

    // Save to the database
    const savedCapsule = await capsule.save();

    // Fetch users with preferences for this theme
    const userPreferences = await UserPreference.find({
      themes: theme,
    }).populate("userId");

    const userIds = userPreferences
      .map((preference) => preference.userId?._id) // Use optional chaining to avoid null/undefined errors
      .filter(Boolean); // Filter out null/undefined user IDs

    // Fetch push tokens for the users
    const users = await User.find({ _id: { $in: userIds } }).select("deviceId");
    const deviceIds = users.map((user) => user.deviceId).filter(Boolean);

    if (deviceIds.length > 0) {
      // Create notification messages
      const { messages, notificationIds } = await createNotificationMessages(
        deviceIds,
        `${title}`,
        `${title} has been published. Check it out now!`,
        { capsuleId: savedCapsule._id },
        "capsule_notification", // Optional category ID
        userIds // Pass userIds to match pushTokens
      );

      console.log("Notification IDs created:", notificationIds);

      // Send notifications
      const tickets = await sendPushNotifications(messages);

      // Debug tickets if needed
      console.log("Push notification tickets:", tickets);
    }

    res.status(201).json({
      success: true,
      message: "Capsule created successfully with associated Wiki terms!",
      data: savedCapsule,
    });
  } catch (error) {
    console.error("Error creating capsule:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not create capsule.",
      error: error.message,
    });
  }
};
