const express = require("express");
const router = express.Router();
const timelineController = require("../controllers/timelineController");

// POST route to create a new timeline
router.post("/create-timeline", timelineController.createTimeline);

// GET route to fetch all timelines for a user
router.get("/", timelineController.getTimelinesForUser);

// POST route to add a new set to an existing timeline
router.post("/:timelineId/add-set", timelineController.addSetToTimeline);

// PATCH route to update the completion status of a task in a timeline
router.patch(
  "/:timelineId/tasks/:taskId",
  timelineController.updateTimelineTaskStatus
);
router.get(
  "/subjects-with-timelines",
  timelineController.getSubjectsWithTimeline
);

module.exports = router;
