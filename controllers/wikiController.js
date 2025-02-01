const Wiki = require("../models/Wiki");

// Create a new wiki term
const createWikiTerm = async (req, res) => {
  try {
    const { term, definition, category } = req.body;

    // Check if the term already exists
    const existingTerm = await Wiki.findOne({ term });
    if (existingTerm) {
      return res.status(400).json({ message: "Term already exists." });
    }

    const newWiki = new Wiki({ term, definition, category });
    await newWiki.save();

    res
      .status(201)
      .json({ message: "Wiki term created successfully.", newWiki });
  } catch (error) {
    res.status(500).json({ message: "Failed to create wiki term.", error });
  }
};

// Get the definition of a wiki term
const getWikiTerm = async (req, res) => {
  try {
    const { term } = req.params;

    const wikiTerm = await Wiki.findOne({ term });
    if (!wikiTerm) {
      return res.status(404).json({ message: "Term not found." });
    }

    res.status(200).json(wikiTerm);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wiki term.", error });
  }
};

// Update a wiki term
const updateWikiTerm = async (req, res) => {
  try {
    const { term } = req.params;
    const { definition, category } = req.body;

    const updatedTerm = await Wiki.findOneAndUpdate(
      { term },
      { definition, category },
      { new: true, runValidators: true }
    );

    if (!updatedTerm) {
      return res.status(404).json({ message: "Term not found." });
    }

    res
      .status(200)
      .json({ message: "Wiki term updated successfully.", updatedTerm });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wiki term.", error });
  }
};

// Delete a wiki term
const deleteWikiTerm = async (req, res) => {
  try {
    const { term } = req.params;

    const deletedTerm = await Wiki.findOneAndDelete({ term });
    if (!deletedTerm) {
      return res.status(404).json({ message: "Term not found." });
    }

    res
      .status(200)
      .json({ message: "Wiki term deleted successfully.", deletedTerm });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete wiki term.", error });
  }
};

module.exports = {
  createWikiTerm,
  getWikiTerm,
  updateWikiTerm,
  deleteWikiTerm,
};
