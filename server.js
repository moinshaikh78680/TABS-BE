const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const routes = require("./routes");
const {
  createNotificationMessages,
} = require("./services/createNotificationMessages");
const { sendPushNotifications } = require("./services/notificationService");
const { Expo } = require("expo-server-sdk");

const expo = new Expo(); // Create a new Expo instance

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use Routes
app.use("/api", routes);
app.post("/send-notification", async (req, res) => {
  const { pushTokens, title, body, data, categoryId } = req.body;

  console.log("Push Tokens Received:", pushTokens);

  if (!Array.isArray(pushTokens)) {
    return res.status(400).send("Push tokens must be an array");
  }

  if (!title || !body) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const messages = createNotificationMessages(
      pushTokens,
      title,
      body,
      data,
      categoryId
    );
    console.log("Messages to Send:", messages);

    const tickets = await sendPushNotifications(messages);
    console.log("Tickets:", tickets);

    res.status(200).send({ success: true, tickets });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/", (req, res) => {
  res.send("Server is running on localhost:5000");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
