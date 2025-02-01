const express = require("express");
const router = express.Router();
const {
  savePreferences,
  getPreferences,
  updatePreferences,
} = require("../controllers/preferenceController");

// Save user preferences
router.post("/save", savePreferences);

// Get user preferences
router.get("/:userId", getPreferences);

// Update user preferences
router.put("/update/:userId", updatePreferences);

module.exports = router;
