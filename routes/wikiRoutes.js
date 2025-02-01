const express = require("express");
const router = express.Router();
const {
  createWikiTerm,
  getWikiTerm,
  updateWikiTerm,
  deleteWikiTerm,
} = require("../controllers/wikiController");

// Create a new wiki term
router.post("/", createWikiTerm);

// Get a wiki term by its name
router.get("/:term", getWikiTerm);

// Update a wiki term by its name
router.put("/:term", updateWikiTerm);

// Delete a wiki term by its name
router.delete("/:term", deleteWikiTerm);

module.exports = router;
