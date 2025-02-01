const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch notifications.",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch notifications with pagination
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    const totalNotifications = await Notification.countDocuments({ userId });
    const totalPages = Math.ceil(totalNotifications / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully.",
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalNotifications,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    console.log("Request URL:", req.originalUrl);
    console.log("Notification ID:", req.params.id);
    const { id } = req.params; // Ensure `id` is extracted from `req.params`

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully.",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
