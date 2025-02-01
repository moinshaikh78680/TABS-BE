const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");

// Route to create a folder
router.post("/create", folderController.createFolder);

// Route to add a capsule to a folder
router.post("/:folderId/save-capsule", folderController.addCapsuleToFolder);
router.post("/create-and-save", folderController.createAndSaveToDefaultFolder);

// Route to add a participant to a folder
router.post(
  "/:folderId/add-participant",
  folderController.addParticipantToFolder
);

// Route to get all folders accessible to a user
router.get("/", folderController.getFoldersForUser);

// Route to get all capsules in a specific folder
router.get("/:folderId", folderController.getCapsulesInFolder);
router.get(
  "/user/get-folders-for-user",
  folderController.getFoldersWithCapsules
);
module.exports = router;
