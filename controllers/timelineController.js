const Timeline = require("../models/Timeline");
const Subject = require("../models/Subject");
const Set = require("../models/Set");
// POST /timelines - Create a new timeline based on the subject's default timeline.
// GET /timelines - Fetch all timelines for a specific user.
// POST /timelines/:timelineId/add-set - Add a new set to an existing timeline.
// PATCH /timelines/:timelineId/tasks/:taskId - Update the completion status of a task in a timeline.

exports.createTimeline = async (req, res) => {
  try {
    const { name, subjectId, userId } = req.body;

    if (!name || !subjectId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Name, subjectId, and userId are required fields.",
      });
    }

    const subject = await Subject.findById(subjectId).populate({
      path: "defaultTimeline.tasks.set",
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    const defaultTimeline = subject.defaultTimeline[0];
    console.log("Default timeline tasks (raw):", defaultTimeline.tasks);

    const timelineTasks = defaultTimeline.tasks
      .filter((task) => {
        if (!task.set) {
          console.warn(`Skipping task without valid set:`, task);
          return false;
        }
        return true;
      })
      .map((task) => ({
        set: task.set._id,
        completed: false,
        addedAt: new Date(),
      }));

    if (timelineTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid tasks found in the default timeline.",
      });
    }

    const timeline = new Timeline({
      name,
      subject: subjectId,
      user: userId,
      tasks: timelineTasks,
    });

    const savedTimeline = await timeline.save();

    res.status(201).json({
      success: true,
      message: "Timeline created successfully!",
      data: savedTimeline,
    });
  } catch (error) {
    console.error("Error creating timeline:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not create timeline.",
      error: error.message,
    });
  }
};

exports.getTimelinesForUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    const timelines = await Timeline.find({ user: userId }).populate(
      "tasks.set"
    );

    res.status(200).json({
      success: true,
      message: "Timelines fetched successfully.",
      data: timelines,
    });
  } catch (error) {
    console.error("Error fetching timelines:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not fetch timelines.",
      error: error.message,
    });
  }
};

exports.addSetToTimeline = async (req, res) => {
  try {
    const { timelineId } = req.params;
    const { setId } = req.body;

    if (!setId) {
      return res.status(400).json({
        success: false,
        message: "setId is required.",
      });
    }

    const timeline = await Timeline.findById(timelineId);

    if (!timeline) {
      return res.status(404).json({
        success: false,
        message: "Timeline not found.",
      });
    }

    if (timeline.tasks.some((task) => task.set.toString() === setId)) {
      return res.status(400).json({
        success: false,
        message: "Set is already in the timeline.",
      });
    }

    timeline.tasks.push({
      set: setId,
      completed: false,
      recommendedOrder: timeline.tasks.length + 1, // Add to the end
    });

    const updatedTimeline = await timeline.save();

    res.status(200).json({
      success: true,
      message: "Set added to timeline successfully.",
      data: updatedTimeline,
    });
  } catch (error) {
    console.error("Error adding set to timeline:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not add set to timeline.",
      error: error.message,
    });
  }
};

exports.updateTimelineTaskStatus = async (req, res) => {
  try {
    const { timelineId, taskId } = req.params;
    const { completed } = req.body;

    const timeline = await Timeline.findById(timelineId);

    if (!timeline) {
      return res.status(404).json({
        success: false,
        message: "Timeline not found.",
      });
    }

    const task = timeline.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found in the timeline.",
      });
    }

    task.completed = completed;

    const updatedTimeline = await timeline.save();

    res.status(200).json({
      success: true,
      message: "Timeline task status updated successfully.",
      data: updatedTimeline,
    });
  } catch (error) {
    console.error("Error updating timeline task status:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not update task status.",
      error: error.message,
    });
  }
};

exports.getSubjectsWithTimeline = async (req, res) => {
  try {
    // Fetch subjects with predefined timelines
    const subjects = await Subject.find({
      defaultTimeline: { $exists: true, $not: { $size: 0 } },
    });

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subjects with predefined timelines found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subjects with predefined timelines fetched successfully.",
      data: subjects,
    });
  } catch (error) {
    console.error("Error fetching subjects with timelines:", error);
    res.status(500).json({
      success: false,
      message:
        "Internal Server Error. Could not fetch subjects with timelines.",
      error: error.message,
    });
  }
};
