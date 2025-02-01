const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/get-all", notificationController.getNotifications);
router.patch("/mark-all-read", notificationController.markAllAsRead);
router.patch("/mark-one-read/:id", notificationController.markAsRead);

module.exports = router;
