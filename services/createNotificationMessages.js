const { Expo } = require("expo-server-sdk");
const Notification = require("../models/Notification"); // Import the Notification model

// Create a new Expo SDK client
const expo = new Expo();

const createNotificationMessages = async (
  pushTokens,
  title,
  body,
  data = {},
  categoryId,
  userIds = [] // Default to an empty array if userIds is not provided
) => {
  const messages = [];
  const notificationIds = []; // Array to hold created notification IDs

  // Log a warning if the lengths do not match
  if (pushTokens.length !== userIds.length) {
    console.warn(
      "Mismatch between pushTokens and userIds lengths. Ensure they match."
    );
  }

  for (const [index, pushToken] of pushTokens.entries()) {
    // Ensure the pushToken is valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue; // Skip invalid push tokens
    }

    // Map push token to user ID, ensuring userIds[index] exists
    const userId = userIds[index] || null;

    if (userId) {
      try {
        // Save the notification in the database and get the notification ID
        const notification = await Notification.create({
          userId,
          title,
          body,
          data: { ...data, userId }, // Add user ID to the data payload
          categoryId,
          isRead: false, // Mark as unread by default
        });

        // Add notification ID to the list
        notificationIds.push(notification._id);

        // Create the message payload
        messages.push({
          to: pushToken,
          sound: "default",
          title,
          body,
          data: { ...data, userId, notificationId: notification._id }, // Include notification ID in the payload
          categoryId,
        });
      } catch (err) {
        console.error("Error saving notification:", err);
      }
    }
  }

  return { messages, notificationIds };
};

module.exports = { createNotificationMessages };
