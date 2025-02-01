const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
const expo = new Expo();

// Function to send push notifications
const sendPushNotifications = async (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    console.error("No messages to send. Ensure messages is a valid array.");
    return;
  }

  try {
    const chunks = expo.chunkPushNotifications(messages); // Chunk messages
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notifications:", error);
      }
    }

    return tickets; // Return tickets for tracking delivery status
  } catch (error) {
    console.error("Error preparing push notifications:", error);
  }
};

module.exports = { sendPushNotifications };
