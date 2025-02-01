const mongoose = require("mongoose");
const UserPreference = require("../models/UserPreference");
const Intent = require("../models/Intent");
const Theme = require("../models/Theme");
const User = require("../models/User");

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Save user preferences
exports.savePreferences = async (req, res) => {
  const { userId, intents, themes } = req.body;

  // Validate inputs
  if (!userId || !Array.isArray(intents) || !Array.isArray(themes)) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  // Validate ObjectIds
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }
  const invalidIntents = intents.filter((intent) => !isValidObjectId(intent));
  const invalidThemes = themes.filter((theme) => !isValidObjectId(theme));
  if (invalidIntents.length > 0 || invalidThemes.length > 0) {
    return res.status(400).json({
      message: "Invalid ObjectIds detected",
      details: {
        invalidIntents,
        invalidThemes,
      },
    });
  }

  try {
    // Find existing preferences for the user
    const existingPreferences = await UserPreference.findOne({ userId });

    if (existingPreferences) {
      // Merge new intents/themes with existing ones, removing duplicates
      const updatedIntents = Array.from(
        new Set([...existingPreferences.intents.map(String), ...intents])
      );
      const updatedThemes = Array.from(
        new Set([...existingPreferences.themes.map(String), ...themes])
      );

      // Update the preferences
      existingPreferences.intents = updatedIntents;
      existingPreferences.themes = updatedThemes;
      await existingPreferences.save();

      return res.status(200).json({
        message: "Preferences updated successfully",
        preferences: existingPreferences,
      });
    } else {
      // Create new preferences if they don't exist
      const newPreferences = new UserPreference({
        userId,
        intents: Array.from(new Set(intents)), // Ensure no duplicates
        themes: Array.from(new Set(themes)), // Ensure no duplicates
      });

      await newPreferences.save();

      return res.status(201).json({
        message: "Preferences saved successfully",
        preferences: newPreferences,
      });
    }
  } catch (error) {
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const preferences = await UserPreference.findOne({ userId })
      .populate("intents", "name description")
      .populate("themes", "name description");

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.status(200).json({ preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  const { userId } = req.params;
  const { intents, themes } = req.body;

  // Validate userId
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  // Validate intents and themes if provided
  if (intents && !Array.isArray(intents)) {
    return res.status(400).json({ message: "Intents must be an array" });
  }

  if (themes && !Array.isArray(themes)) {
    return res.status(400).json({ message: "Themes must be an array" });
  }

  const invalidIntents = intents?.filter((intent) => !isValidObjectId(intent));
  const invalidThemes = themes?.filter((theme) => !isValidObjectId(theme));

  if (
    (intents && invalidIntents?.length > 0) ||
    (themes && invalidThemes?.length > 0)
  ) {
    return res.status(400).json({
      message: "Invalid ObjectIds detected",
      details: {
        invalidIntents,
        invalidThemes,
      },
    });
  }

  try {
    const preferences = await UserPreference.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    // Update preferences
    preferences.intents = intents || preferences.intents;
    preferences.themes = themes || preferences.themes;

    await preferences.save();
    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
