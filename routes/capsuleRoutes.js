const express = require("express");
const router = express.Router();
const capsuleController = require("../controllers/capsuleController");

// POST route to create a new capsule
router.post("/create-capsule", capsuleController.createCapsule);

module.exports = router;
