const express = require("express");
const capsuleRoutes = require("./capsuleRoutes");
const userRoutes = require("./userRoutes");
const routePreference = require("./routePreference");
const contentRoutes = require("./contentRoutes");
const folderRoutes = require("./folderRoutes");
const timelineController = require("./timelineRoutes");
const userInteractionRoutes = require("./userInteractionRoutes");
const notificationRoutes = require("./notificationRoutes");
const wikiRoutes = require("./wikiRoutes");
const router = express.Router();

router.use("/creator", capsuleRoutes);
router.use("/users", userRoutes);
router.use("/preferences", routePreference);
router.use("/content", contentRoutes);
router.use("/folders", folderRoutes);
router.use("/timelines", timelineController);
router.use("/interaction", userInteractionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/wikis", wikiRoutes);
// router.use("/intents", intentRoutes);
// router.use("/capsules", capsuleRoutes);

module.exports = router;
