const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

// Log exported contentController to verify
console.log("Content Controller:", contentController);

// Routes for content hierarchy
router.get("/intents", contentController.getIntents); // Fetch all intents
router.get("/themes", contentController.getThemesByIntents); // Fetch themes by intent ID
router.get("/subjects/preference", contentController.getSubjectsByThemes); // Fetch subjects by theme ID
router.get("/subjects/:subjectId/sets", contentController.getSetsBySubject); // Fetch sets by subject ID
router.get("/sets/:setId/capsules", contentController.getCapsulesBySet); // Fetch capsules by set ID
router.get("/capsules/:capsuleId/slides", contentController.getSlidesByCapsule); // Fetch slides by capsule ID

// Search-related routes
router.get("/search", contentController.searchContent);
router.post("/capsules/getSavedStatus", contentController.getSavedStatus);

// Preference-related routes
router.get("/intents/preference", contentController.getIntentsWithPreferences);
router.get("/sets/preference", contentController.getSetsByPreferences);

// Trending and Top Items
router.get(
  "/top/sets-by-saved-capsules",
  contentController.getTopSetsByCapsules
);

// General fetching routes
router.get("/themes/with-without-intents", contentController.getThemes);
router.get("/subjects/with-without-themes", contentController.getSubjects);
router.get("/sets/with-without-subjects", contentController.getSets);

// Capsule-specific routes
router.post("/capsules/save", contentController.saveCapsule);
router.get("/capsules/get-saved", contentController.getSavedCapsules);
router.get("/capsules/get-suggested", contentController.getSuggestedCapsules);
router.get("/capsules/preferences", contentController.getCapsulesByPreferences);
router.get("/capsules/getNext/:capsuleId", contentController.getNextCapsule);
// Check if any function is undefined
Object.entries(contentController).forEach(([key, value]) => {
  if (typeof value !== "function") {
    console.error(`Controller function "${key}" is undefined!`);
  }
});

module.exports = router;
