const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO DB",process.env.MONGO_URI)
    const conn = await mongoose.connect("mongodb+srv://moinshaikh78680:Master0947@tabs.ettie.mongodb.net/tabs", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
