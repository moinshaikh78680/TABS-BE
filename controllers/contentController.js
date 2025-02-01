const mongoose = require("mongoose");
const Intent = require("../models/Intent");
const Theme = require("../models/Theme");
const Subject = require("../models/Subject");
const Set = require("../models/Set");
const Capsule = require("../models/Capsule");
const SavedCapsule = require("../models/SavedCapsule");
const Folder = require("../models/Folder");

// Utility for pagination
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

// Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fetch all intents with pagination
exports.getIntents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const intents = await paginate(Intent.find(), page, limit);
    const total = await Intent.countDocuments();

    res.status(200).json({
      success: true,
      data: intents,
      pagination: { total, page, limit },
    });
  } catch (error) {
    console.error("Error fetching intents:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch themes by intent ID with pagination
exports.getThemesByIntents = async (req, res) => {
  try {
    const { intentIds } = req.query; // Expecting a comma-separated string of intentIds
    const { page = 1, limit = 10 } = req.query;

    if (!intentIds) {
      return res
        .status(400)
        .json({ success: false, message: "intentIds parameter is required." });
    }

    // Convert intentIds string to an array
    const intentIdArray = intentIds.split(",");

    // Validate ObjectIds
    if (intentIdArray.some((id) => !isValidObjectId(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Intent IDs provided." });
    }

    // Query the database
    const themes = await Theme.find({ intentId: { $in: intentIdArray } })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Theme.countDocuments({
      intentId: { $in: intentIdArray },
    });

    if (!themes || themes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No themes found for the given Intent IDs.",
      });
    }

    res.status(200).json({
      success: true,
      data: themes,
      pagination: { total, page, limit },
    });
  } catch (error) {
    console.error("Error fetching themes by intents:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Fetch subjects by theme ID with pagination
exports.getSubjectsByThemes = async (req, res) => {
  try {
    const { themeIds } = req.query; // Expecting a comma-separated string of themeIds
    const { page = 1, limit = 10 } = req.query;

    if (!themeIds) {
      return res
        .status(400)
        .json({ success: false, message: "Theme IDs are required." });
    }

    // Convert themeIds to an array
    const themeIdArray = themeIds.split(",");

    // Validate ObjectIds
    if (themeIdArray.some((id) => !isValidObjectId(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Theme IDs provided." });
    }

    // Fetch subjects based on theme IDs
    const subjects = await Subject.find({ theme: { $in: themeIdArray } })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Subject.countDocuments({
      theme: { $in: themeIdArray },
    });

    res.status(200).json({
      success: true,
      data: subjects,
      pagination: { total, page, limit },
    });
  } catch (error) {
    console.error("Error fetching subjects by themes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch sets by subject ID with pagination
exports.getSetsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(subjectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Subject ID" });
    }

    const sets = await paginate(Set.find({ subject: subjectId }), page, limit);
    const total = await Set.countDocuments({ subject: subjectId });

    res.status(200).json({
      success: true,
      data: sets,
      pagination: { total, page, limit },
    });
  } catch (error) {
    console.error("Error fetching sets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch capsules by set ID with pagination
exports.getCapsulesBySet = async (req, res) => {
  try {
    const { setId, page = 1, limit = 10 } = req.query;

    if (!setId || !mongoose.Types.ObjectId.isValid(setId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing Set ID" });
    }

    const capsules = await Capsule.find({ set: setId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("title slides metadata.saveCount metadata.viewCount")
      .lean();

    const total = await Capsule.countDocuments({ set: setId });

    res.status(200).json({
      success: true,
      data: capsules,
      pagination: { total, page, limit },
    });
  } catch (error) {
    console.error("Error fetching capsules by set:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getSlidesByCapsule = async (req, res) => {
  try {
    const { capsuleId } = req.params;

    // Validate capsuleId
    if (!capsuleId) {
      return res.status(400).json({
        success: false,
        message: "Capsule ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Capsule ID format.",
      });
    }

    // Find capsule by ID and populate wiki terms
    const capsule = await Capsule.findById(capsuleId)
      .select("slides wikiIds") // Select slides and wikiIds
      .populate({
        path: "wikiIds", // Populate the wiki terms
        select: "term definition", // Include only the term and definition fields
      });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: "Capsule not found.",
      });
    }

    if (!capsule.slides || capsule.slides.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No slides found for the given capsule.",
      });
    }

    // Respond with the slides and associated wiki terms
    res.status(200).json({
      success: true,
      data: {
        slides: capsule.slides,
        wikiTerms: capsule.wikiIds, // Include populated wiki terms
      },
    });
  } catch (error) {
    console.error("Error fetching slides by capsule:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while fetching slides.",
    });
  }
};

// Search across all content categories
exports.searchContent = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    // Validate the query parameter
    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }

    // Create a regex for case-insensitive search
    const searchRegex = new RegExp(query, "i");

    // Perform parallel searches across collections
    const [intents, themes, subjects, sets, capsules] = await Promise.all([
      paginate(Intent.find({ name: searchRegex }), page, limit),
      paginate(Theme.find({ name: searchRegex }), page, limit),
      paginate(Subject.find({ name: searchRegex }), page, limit),
      paginate(Set.find({ name: searchRegex }), page, limit),
      paginate(
        Capsule.find({ title: searchRegex }).select(
          "title metadata.saveCount slides questionOrPoll"
        ),
        page,
        limit
      ),
    ]);

    // Return the search results (empty arrays if no results found)
    res.status(200).json({
      success: true,
      data: { intents, themes, subjects, sets, capsules },
      pagination: { page, limit },
    });
  } catch (error) {
    console.error("Error searching content:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while searching content.",
    });
  }
};

exports.getIntentsWithPreferences = async (req, res) => {
  console.log("inetemsm");
  try {
    const { preferredIntentIds } = req.query; // Expecting a comma-separated string of intent IDs
    const preferredIdsArray = preferredIntentIds?.split(",") || [];

    // Validate ObjectIds
    if (
      preferredIdsArray.length > 0 &&
      preferredIdsArray.some((id) => !isValidObjectId(id))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Intent IDs provided." });
    }

    // Fetch all intents and mark preferred ones
    const intents = await Intent.find().lean();
    const intentsWithPreferences = intents.map((intent) => ({
      ...intent,
      isPreferred: preferredIdsArray.includes(intent._id.toString()),
    }));

    res.status(200).json({ success: true, data: intentsWithPreferences });
  } catch (error) {
    console.error("Error fetching intents with preferences:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getSetsByPreferences = async (req, res) => {
  try {
    const { intentIds, themeIds } = req.query; // Expecting comma-separated IDs
    const intentIdArray = intentIds?.split(",") || [];
    const themeIdArray = themeIds?.split(",") || [];

    // Validate ObjectIds
    if (
      intentIdArray.some((id) => !isValidObjectId(id)) ||
      themeIdArray.some((id) => !isValidObjectId(id))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid IDs provided." });
    }

    const sets = await Set.find({
      $or: [
        { intent: { $in: intentIdArray } },
        { theme: { $in: themeIdArray } },
      ],
    });
    console.log("setsBG", sets, intentIds, themeIds);

    res.status(200).json({ success: true, data: sets });
  } catch (error) {
    console.error("Error fetching sets by preferences:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getTopSetsByCapsules = async (req, res) => {
  console.log("paaa", req, res);
  try {
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Aggregation pipeline to get sets with most saved capsules
    const setsWithMostSavedCapsules = await Capsule.aggregate([
      {
        $group: {
          _id: "$set", // Group by set
          totalSaveCount: { $sum: "$metadata.saveCount" }, // Sum saveCount of capsules
        },
      },
      {
        $sort: { totalSaveCount: -1 }, // Sort by totalSaveCount in descending order
      },
      {
        $skip: skip, // Skip for pagination
      },
      {
        $limit: parsedLimit, // Limit for pagination
      },
      {
        $lookup: {
          from: "sets", // Join with the Set collection
          localField: "_id",
          foreignField: "_id",
          as: "setDetails",
        },
      },
      {
        $unwind: "$setDetails", // Flatten the joined array
      },
      {
        $lookup: {
          from: "subjects", // Join with the Subject collection for subject details
          localField: "setDetails.subject",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      {
        $unwind: "$subjectDetails", // Flatten the joined array for subjects
      },
      {
        $project: {
          _id: 0, // Exclude the aggregation `_id`
          setId: "$setDetails._id",
          setName: "$setDetails.name",
          setDescription: "$setDetails.description",
          subjectName: "$subjectDetails.name",
          subjectDescription: "$subjectDetails.description",
          totalSaveCount: 1,
        },
      },
    ]);

    // Get total number of sets with saved capsules
    const totalSets = await Capsule.aggregate([
      {
        $group: {
          _id: "$set",
          totalSaveCount: { $sum: "$metadata.saveCount" },
        },
      },
      { $count: "total" },
    ]);

    const totalElements = totalSets[0]?.total || 0;
    const totalPages = Math.ceil(totalElements / parsedLimit);

    res.status(200).json({
      success: true,
      data: setsWithMostSavedCapsules,
      pagination: {
        totalElements,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching sets with most saved capsules:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch themes based on intent or top themes with most saved capsules
exports.getThemes = async (req, res) => {
  try {
    const { intentId, page = 1, limit = 10 } = req.query;

    if (intentId) {
      // Fetch themes based on intentId
      const themes = await paginate(
        Theme.find({ intentId }), // Match themes by intentId
        page,
        limit
      );
      const total = await Theme.countDocuments({ intentId });

      return res.status(200).json({
        success: true,
        data: themes,
        pagination: {
          total,
          page,
          limit,
        },
      });
    } else {
      // Fetch top themes with the most saved capsules
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const skip = (parsedPage - 1) * parsedLimit;

      const topThemes = await Capsule.aggregate([
        {
          $group: {
            _id: "$theme", // Group by theme
            totalSaveCount: { $sum: "$metadata.saveCount" }, // Sum saveCount
          },
        },
        { $sort: { totalSaveCount: -1 } }, // Sort by save count in descending order
        { $skip: skip }, // Pagination: skip
        { $limit: parsedLimit }, // Pagination: limit
        {
          $lookup: {
            from: "themes", // Join with themes collection
            localField: "_id",
            foreignField: "_id",
            as: "themeDetails",
          },
        },
        { $unwind: "$themeDetails" }, // Flatten themeDetails array
        {
          $project: {
            _id: 0,
            themeId: "$themeDetails._id",
            themeName: "$themeDetails.name",
            themeDescription: "$themeDetails.description",
            totalSaveCount: 1,
          },
        },
      ]);

      const totalThemes = await Capsule.aggregate([
        {
          $group: {
            _id: "$theme",
          },
        },
        { $count: "total" },
      ]);

      const totalElements = totalThemes[0]?.total || 0;
      const totalPages = Math.ceil(totalElements / parsedLimit);

      return res.status(200).json({
        success: true,
        data: topThemes,
        pagination: {
          totalElements,
          totalPages,
          currentPage: parsedPage,
          limit: parsedLimit,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching themes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getSubjects = async (req, res) => {
  try {
    const { themeId, page = 1, limit = 10 } = req.query;

    if (themeId) {
      // Fetch subjects by theme ID
      const subjects = await paginate(
        Subject.find({ theme: themeId }),
        page,
        limit
      );
      const total = await Subject.countDocuments({ theme: themeId });

      return res.status(200).json({
        success: true,
        data: subjects,
        pagination: {
          total,
          page,
          limit,
        },
      });
    } else {
      // Fetch top subjects with most saved capsules
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const skip = (parsedPage - 1) * parsedLimit;

      const topSubjects = await Capsule.aggregate([
        {
          $group: {
            _id: "$subject", // Group by subject
            totalSaveCount: { $sum: "$metadata.saveCount" }, // Sum saveCount
          },
        },
        { $sort: { totalSaveCount: -1 } }, // Sort by save count in descending order
        { $skip: skip }, // Pagination: skip
        { $limit: parsedLimit }, // Pagination: limit
        {
          $lookup: {
            from: "subjects", // Join with subjects collection
            localField: "_id",
            foreignField: "_id",
            as: "subjectDetails",
          },
        },
        { $unwind: "$subjectDetails" }, // Unwind the subject details
        {
          $project: {
            _id: 0,
            subjectId: "$subjectDetails._id",
            subjectName: "$subjectDetails.name",
            subjectDescription: "$subjectDetails.description",
            totalSaveCount: 1,
          },
        },
      ]);

      const totalSubjects = await Capsule.aggregate([
        {
          $group: {
            _id: "$subject",
          },
        },
        { $count: "total" },
      ]);

      const totalElements = totalSubjects[0]?.total || 0;
      const totalPages = Math.ceil(totalElements / parsedLimit);

      return res.status(200).json({
        success: true,
        data: topSubjects,
        pagination: {
          totalElements,
          totalPages,
          currentPage: parsedPage,
          limit: parsedLimit,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getSets = async (req, res) => {
  try {
    const { subjectId, page = 1, limit = 10 } = req.query;

    if (subjectId) {
      // Fetch sets by subject ID
      const sets = await paginate(
        Set.find({ subject: subjectId }),
        page,
        limit
      );
      const total = await Set.countDocuments({ subject: subjectId });

      return res.status(200).json({
        success: true,
        data: sets,
        pagination: {
          total,
          page,
          limit,
        },
      });
    } else {
      // Fetch top sets with most saved capsules
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const skip = (parsedPage - 1) * parsedLimit;

      const topSets = await Capsule.aggregate([
        {
          $group: {
            _id: "$set", // Group by set
            totalSaveCount: { $sum: "$metadata.saveCount" }, // Sum saveCount
          },
        },
        { $sort: { totalSaveCount: -1 } }, // Sort by save count in descending order
        { $skip: skip }, // Pagination: skip
        { $limit: parsedLimit }, // Pagination: limit
        {
          $lookup: {
            from: "sets", // Join with sets collection
            localField: "_id",
            foreignField: "_id",
            as: "setDetails",
          },
        },
        { $unwind: "$setDetails" }, // Unwind the set details
        {
          $lookup: {
            from: "subjects", // Join with subjects collection for subject details
            localField: "setDetails.subject",
            foreignField: "_id",
            as: "subjectDetails",
          },
        },
        { $unwind: "$subjectDetails" }, // Unwind the subject details
        {
          $project: {
            _id: 0,
            setId: "$setDetails._id",
            setName: "$setDetails.name",
            setDescription: "$setDetails.description",
            subjectName: "$subjectDetails.name",
            subjectDescription: "$subjectDetails.description",
            totalSaveCount: 1,
          },
        },
      ]);

      const totalSets = await Capsule.aggregate([
        {
          $group: {
            _id: "$set",
          },
        },
        { $count: "total" },
      ]);

      const totalElements = totalSets[0]?.total || 0;
      const totalPages = Math.ceil(totalElements / parsedLimit);

      return res.status(200).json({
        success: true,
        data: topSets,
        pagination: {
          totalElements,
          totalPages,
          currentPage: parsedPage,
          limit: parsedLimit,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching sets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getCapsulesBySet = async (req, res) => {
  try {
    const { setId, page = 1, limit = 10 } = req.query;

    if (!setId) {
      return res
        .status(400)
        .json({ success: false, message: "Set ID is required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(setId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Set ID" });
    }

    // Fetch capsules for the given set
    const capsules = await Capsule.find({ set: setId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("title slides metadata.saveCount createdAt updatedAt")
      .lean();

    const total = await Capsule.countDocuments({ set: setId });

    res.status(200).json({
      success: true,
      data: capsules,
      pagination: {
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching capsules:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getSlidesOfCapsule = async (req, res) => {
  try {
    const { capsuleId } = req.params;

    // Find the capsule by ID and select the slides field
    const capsule = await Capsule.findById(capsuleId)
      .select("slides wikiIds") // Select slides and wikiIds
      .populate({
        path: "wikiIds", // Populate the wiki terms
        select: "term definition", // Include only the term and definition fields
      });

    if (!capsule) {
      return res
        .status(404)
        .json({ success: false, message: "Capsule not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        slides: capsule.slides,
        wikiTerms: capsule.wikiIds, // Include populated wiki terms
      },
    });
  } catch (error) {
    console.error("Error fetching slides by capsule:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.saveCapsule = async (req, res) => {
  try {
    const { capsuleId, userId } = req.body;
    //const userId = req.user.id; // Assuming user ID is extracted from the request (e.g., JWT auth)

    // Validate capsuleId and userId
    if (
      !mongoose.Types.ObjectId.isValid(capsuleId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid capsuleId or userId provided.",
      });
    }

    // Check if the capsule is already saved by the user
    const existingSave = await SavedCapsule.findOne({ capsuleId, userId });

    if (existingSave) {
      // If it exists, unsave it
      await SavedCapsule.findByIdAndDelete(existingSave._id);
      return res.status(200).json({ success: true, isSaved: false });
    } else {
      // If it doesn't exist, save it
      const newSave = new SavedCapsule({ capsuleId, userId });
      await newSave.save();
      return res.status(200).json({ success: true, isSaved: true });
    }
  } catch (error) {
    console.error("Error toggling save capsule:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while toggling save status.",
    });
  }
};

// Get saved capsules for a user
exports.getSavedCapsules = async (req, res) => {
  try {
    const { userId } = req.query; // Extract userId from query parameters

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const savedCapsules = await SavedCapsule.find({ userId })
      .populate("capsuleId", "title description")
      .lean();

    if (!savedCapsules.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No saved capsules found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      data: savedCapsules.map((item) => ({
        id: item.capsuleId._id,
        title: item.capsuleId.title,
        description: item.capsuleId.description,
      })),
    });
  } catch (error) {
    console.error("Error fetching saved capsules:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
exports.getSuggestedCapsules = async (req, res) => {
  try {
    const { userId } = req.query; // Extract userId from query parameters

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Find capsules saved by the current user
    const userSavedCapsules = await SavedCapsule.find({ userId }).distinct(
      "capsuleId"
    );

    // Fetch capsules not saved by the current user, sorted by saveCount
    const suggestedCapsules = await Capsule.find({
      _id: { $nin: userSavedCapsules },
    })
      .sort({ "metadata.saveCount": -1 })
      .limit(10)
      .select("title description metadata.saveCount");

    if (!suggestedCapsules.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No suggested capsules available for this user.",
      });
    }

    res.status(200).json({
      success: true,
      data: suggestedCapsules.map((capsule) => ({
        id: capsule._id,
        title: capsule.title,
        description: capsule.description,
        saveCount: capsule.metadata.saveCount,
      })),
    });
  } catch (error) {
    console.error("Error fetching suggested capsules:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.getCapsulesByPreferences = async (req, res) => {
  try {
    const {
      userId,
      intents = "",
      themes = "",
      page = 1,
      limit = 10,
    } = req.query;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch preferences.",
      });
    }

    // Split intents and themes into arrays and convert them to ObjectIds
    const intentIds = intents
      .split(",")
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(id));
    const themeIds = themes
      .split(",")
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(id));

    // Pagination offsets
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Match criteria for intents or themes
    const matchCriteria = {
      $or: [{ intent: { $in: intentIds } }, { theme: { $in: themeIds } }],
    };

    // Fetch capsules with randomization and pagination
    const capsules = await Capsule.aggregate([
      { $match: matchCriteria }, // Match the criteria
      {
        $sample: {
          size: 100, // Fetch a larger random pool
        },
      },
      {
        $group: {
          _id: "$_id", // Deduplicate by capsule `_id`
          doc: { $first: "$$ROOT" }, // Keep the entire document
        },
      },
      { $replaceRoot: { newRoot: "$doc" } }, // Replace with deduplicated documents
      { $skip: skip },
      { $limit: parseInt(limit, 10) },
      {
        $lookup: {
          from: "folders", // Folder collection
          let: { capsuleId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$creator", new mongoose.Types.ObjectId(userId)] },
                    { $in: ["$$capsuleId", "$capsules"] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "savedInFolders",
        },
      },
      {
        $addFields: {
          isSaved: { $gt: [{ $size: "$savedInFolders" }, 0] }, // True if capsule is saved
        },
      },
      {
        $project: {
          savedInFolders: 0, // Remove folder details from the response
        },
      },
    ]);

    // Total count of capsules (without randomization for accurate count)
    const totalCapsules = await Capsule.countDocuments(matchCriteria);
    const totalPages = Math.ceil(totalCapsules / parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      message: "Random capsules fetched successfully.",
      data: capsules,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalItems: totalCapsules,
      },
    });
  } catch (error) {
    console.error("Error fetching random capsules:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.getSavedStatus = async (req, res) => {
  try {
    const { userId, capsuleId } = req.body;

    // Validate input
    if (!userId || !capsuleId) {
      return res.status(400).json({
        success: false,
        message: "User ID and capsule ID are required.",
      });
    }

    // Validate capsuleId format
    if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Capsule ID format.",
      });
    }

    // Check if the capsule is saved in any folder created by the user
    const isSaved = await Folder.exists({
      creator: userId,
      capsules: new mongoose.Types.ObjectId(capsuleId),
    });

    return res.status(200).json({
      success: true,
      data: { isSaved: !!isSaved }, // Return true if saved, false otherwise
    });
  } catch (error) {
    console.error("Error fetching saved status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching saved status.",
      error: error.message,
    });
  }
};
exports.getNextCapsule = async (req, res) => {
  try {
    const { capsuleId } = req.params;

    // Validate capsuleId
    if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Capsule ID" });
    }

    // Fetch the current capsule
    const currentCapsule = await Capsule.findById(capsuleId).populate({
      path: "set subject theme",
      select: "name order",
    });

    if (!currentCapsule) {
      return res
        .status(404)
        .json({ success: false, message: "Capsule not found" });
    }

    // Step 1: Find next capsule in the same set
    const nextCapsule = await Capsule.findOne({
      set: currentCapsule.set._id,
      _id: { $gt: capsuleId }, // Next capsule in the set
    }).sort({ _id: 1 });

    if (nextCapsule) {
      return res.status(200).json({ success: true, data: nextCapsule });
    }

    // Step 2: Find next set in the same subject
    const nextSet = await Set.findOne({
      subject: currentCapsule.subject._id,
      _id: { $gt: currentCapsule.set._id }, // Next set in the subject
    }).sort({ _id: 1 });

    if (nextSet) {
      const firstCapsuleInSet = await Capsule.findOne({
        set: nextSet._id,
      }).sort({ _id: 1 });
      if (firstCapsuleInSet) {
        return res.status(200).json({ success: true, data: firstCapsuleInSet });
      }
    }

    // Step 3: Find next subject in the same theme
    const nextSubject = await Subject.findOne({
      theme: currentCapsule.theme._id,
      _id: { $gt: currentCapsule.subject._id },
    }).sort({ _id: 1 });

    if (nextSubject) {
      const firstSetInSubject = await Set.findOne({
        subject: nextSubject._id,
      }).sort({ _id: 1 });
      if (firstSetInSubject) {
        const firstCapsuleInSet = await Capsule.findOne({
          set: firstSetInSubject._id,
        }).sort({ _id: 1 });
        if (firstCapsuleInSet) {
          return res
            .status(200)
            .json({ success: true, data: firstCapsuleInSet });
        }
      }
    }

    // Step 4: Find next theme in the intent
    const nextTheme = await Theme.findOne({
      intent: currentCapsule.theme.intent,
      _id: { $gt: currentCapsule.theme._id },
    }).sort({ _id: 1 });

    if (nextTheme) {
      const firstSubjectInTheme = await Subject.findOne({
        theme: nextTheme._id,
      }).sort({ _id: 1 });
      if (firstSubjectInTheme) {
        const firstSetInSubject = await Set.findOne({
          subject: firstSubjectInTheme._id,
        }).sort({ _id: 1 });
        if (firstSetInSubject) {
          const firstCapsuleInSet = await Capsule.findOne({
            set: firstSetInSubject._id,
          }).sort({ _id: 1 });
          if (firstCapsuleInSet) {
            return res
              .status(200)
              .json({ success: true, data: firstCapsuleInSet });
          }
        }
      }
    }

    // Fallback: Return a trending or popular capsule
    const trendingCapsule = await Capsule.findOne()
      .sort({ "metadata.saveCount": -1 })
      .limit(1);

    if (trendingCapsule) {
      return res.status(200).json({ success: true, data: trendingCapsule });
    }

    return res
      .status(404)
      .json({ success: false, message: "No recommendations available" });
  } catch (error) {
    console.error("Error fetching next capsule:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
