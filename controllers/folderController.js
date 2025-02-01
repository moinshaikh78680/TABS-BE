const Capsule = require("../models/Capsule");
const Folder = require("../models/Folder");

exports.createFolder = async (req, res) => {
  try {
    const { name, description, privacy, userId } = req.body;

    if (!name || !privacy || !userId) {
      return res.status(400).json({
        success: false,
        message: "Name, privacy, and userId are required fields.",
      });
    }

    if (!["personal", "public"].includes(privacy)) {
      return res.status(400).json({
        success: false,
        message: "Privacy must be either 'personal' or 'public'.",
      });
    }

    const folder = new Folder({
      name,
      description,
      privacy,
      creator: userId,
      participants: privacy === "public" ? [userId] : [], // Add creator as a participant for public folders
    });

    const savedFolder = await folder.save();

    res.status(201).json({
      success: true,
      message: "Folder created successfully.",
      data: savedFolder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not create folder.",
      error: error.message,
    });
  }
};
exports.addCapsuleToFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { capsuleId, userId } = req.body;

    let folder;

    // If folderId is not provided, create a private folder
    if (!folderId) {
      folder = await Folder.findOneAndUpdate(
        { creator: userId, name: "Default Folder", privacy: "personal" },
        { creator: userId, name: "Default Folder", privacy: "personal" },
        { upsert: true, new: true } // Create if not exists
      );
    } else {
      folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "Folder not found.",
        });
      }

      // Check access permissions
      if (folder.privacy === "personal" && !folder.creator.equals(userId)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to modify this personal folder.",
        });
      }

      if (
        folder.privacy === "public" &&
        !folder.participants.includes(userId) &&
        !folder.creator.equals(userId)
      ) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this public folder.",
        });
      }
    }

    // Check if the capsule is already in the folder
    if (folder.capsules.includes(capsuleId)) {
      return res.status(400).json({
        success: false,
        message: "Capsule is already in the folder.",
      });
    }

    // Add capsule to the folder
    folder.capsules.push(capsuleId);
    const updatedFolder = await folder.save();
    await Capsule.findByIdAndUpdate(
      capsuleId,
      { $inc: { "metadata.saveCount": 1 } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Capsule added to folder successfully.",
      data: updatedFolder,
    });
  } catch (error) {
    console.error("Error adding capsule to folder:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not add capsule to folder.",
      error: error.message,
    });
  }
};
exports.createAndSaveToDefaultFolder = async (req, res) => {
  try {
    const { capsuleId, userId } = req.body;

    // Find or create the default folder
    const defaultFolder = await Folder.findOneAndUpdate(
      { creator: userId, name: "Default Folder", privacy: "personal" },
      { creator: userId, name: "Default Folder", privacy: "personal" },
      { upsert: true, new: true } // Create if not exists
    );

    // Check if the capsule is already in the default folder
    if (defaultFolder.capsules.includes(capsuleId)) {
      return res.status(400).json({
        success: false,
        message: "Capsule is already in the Default Folder.",
      });
    }

    // Add capsule to the default folder
    defaultFolder.capsules.push(capsuleId);
    await defaultFolder.save();
    // Increment saveCount in the Capsule model
    await Capsule.findByIdAndUpdate(
      capsuleId,
      { $inc: { "metadata.saveCount": 1 } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Capsule added to Default Folder successfully.",
      data: defaultFolder,
    });
  } catch (error) {
    console.error("Error creating default folder and saving capsule:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not save capsule.",
      error: error.message,
    });
  }
};

exports.addParticipantToFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { userId, participantId } = req.body;

    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found.",
      });
    }

    if (!folder.creator.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the folder creator can add participants.",
      });
    }

    if (folder.privacy !== "public") {
      return res.status(400).json({
        success: false,
        message: "Participants can only be added to public folders.",
      });
    }

    if (folder.participants.includes(participantId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a participant in this folder.",
      });
    }

    folder.participants.push(participantId);
    const updatedFolder = await folder.save();

    res.status(200).json({
      success: true,
      message: "Participant added successfully.",
      data: updatedFolder,
    });
  } catch (error) {
    console.error("Error adding participant to folder:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not add participant to folder.",
      error: error.message,
    });
  }
};
exports.getFoldersForUser = async (req, res) => {
  try {
    const { userId } = req.query;

    const folders = await Folder.find({
      $or: [{ creator: userId }, { participants: userId }],
    });

    res.status(200).json({
      success: true,
      message: "Folders fetched successfully.",
      data: folders,
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not fetch folders.",
      error: error.message,
    });
  }
};
exports.getCapsulesInFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { userId } = req.query;

    const folder = await Folder.findById(folderId).populate("capsules");

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found.",
      });
    }

    if (
      folder.privacy === "personal" &&
      !folder.creator.equals(userId) &&
      !folder.participants.includes(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this folder.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Capsules fetched successfully.",
      data: folder.capsules,
    });
  } catch (error) {
    console.error("Error fetching capsules in folder:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not fetch capsules.",
      error: error.message,
    });
  }
};

exports.getFoldersWithCapsules = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Fetch folders where the user is a creator or participant
    const folders = await Folder.find({
      $or: [{ creator: userId }, { participants: userId }],
    }).populate("capsules", "title description"); // Populate capsules with selected fields

    if (!folders || folders.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No folders found for the user.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Folders fetched successfully.",
      data: folders,
    });
  } catch (error) {
    console.error("Error fetching folders with capsules:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not fetch folders.",
      error: error.message,
    });
  }
};
