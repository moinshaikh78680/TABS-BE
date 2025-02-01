const axios = require("axios");

// Temporary in-memory storage for OTPs (use Redis or a database in production)
// const otpStorage = {};

// Helper function to send SMS using Gupshup
const sendSms = async (mobile, message) => {
  try {
    const response = await axios.post(
      "https://api.gupshup.io/sms/v1/message",
      null,
      {
        headers: {
          apikey: "x5ffa6bctzghbrpixuvo3xegrkdie1fd", // Replace with your Gupshup API key
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          channel: "sms",
          source: process.env.GUPSHUP_SENDER_ID || "TABBLT", // Replace with your Sender ID
          destination: mobile,
          message: message,
        },
      }
    );
    

    if (response.data.responseCode === "success") {
      console.log("SMS sent successfully:", response.data);
      return true;
    } else {
      console.error("Failed to send SMS:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

// Controller to send OTP
exports.generateOtp = async (req, res) => {
  const { mobile } = req.body;

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store the OTP temporarily (use Redis or database in production)
//   otpStorage[mobile] = {
//     otp,
//     expiresAt: Date.now() + 5 * 60 * 1000, // OTP valid for 5 minutes
//   };

  // Send the OTP via SMS
  const message = `Your OTP is ${otp}. It will expire in 5 minutes.`;
  const smsSent = await sendSms(mobile, message);

  if (smsSent) {
    res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

// Controller to verify OTP

