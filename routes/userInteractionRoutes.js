const express = require("express");
const router = express.Router();
const userInteractionController = require("../controllers/userInteractionController");

// Save user preferences
router.post("/updateAnswer", userInteractionController.submitInteraction);

module.exports = router;
