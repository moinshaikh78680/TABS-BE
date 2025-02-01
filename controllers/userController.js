const User = require("../models/User");
const UserPreference = require("../models/UserPreference");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper to validate mobile number (basic regex for demo purposes)
const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, mobile, password, deviceId } = req.body;

    console.log("backend", { mobile, deviceId });

    // Validate input
    if (!name || !mobile || !password || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile number, password, and device ID are required.",
      });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mobile number. Please provide a valid 10-digit number.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if the mobile number is already registered
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is already registered.",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      deviceId, // Store the deviceId
    });

    // Generate JWT for the user (expires in 7 days for demo purposes)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Retrieve user preferences if available
    const preferences = await UserPreference.findOne({ userId: user._id })
      .populate("intents", "name description")
      .populate("themes", "name description");

    const hasSelectedPreferences = !!preferences;

    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        hasSelectedPreferences,
        preferences: preferences || null,
      },
      token, // Token for login
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
