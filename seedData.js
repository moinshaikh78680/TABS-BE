const mongoose = require("mongoose");
const Intent = require("./models/Intent");
const Theme = require("./models/Theme");
const Subject = require("./models/Subject");
const Set = require("./models/Set");

const seedDatabase = async () => {
  console.log("Zhiihihih")
  try {
    await mongoose.connect("mongodb://localhost:27017/tabs", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Step 1: Create Intents
    const intents = [
      {
        name: "SkillBoost (Skills)",
        description: "Improve your skills and career.",
      },
      {
        name: "Headline (News)",
        description: "Stay updated with the latest news.",
      },
      {
        name: "Spotlight (Entertainment World)",
        description: "Explore movies and celebrity news.",
      },
      {
        name: "Inspire (Success Stories)",
        description: "Learn from success stories.",
      },
      {
        name: "Drive (Motivational Content)",
        description: "Stay motivated with uplifting content.",
      },
    ];

    const intentIds = {};
    for (const intentData of intents) {
      const intent = await Intent.create(intentData);
      intentIds[intent.name] = intent._id;
    }

    console.log("Intents created:", intentIds);

    // Step 2: Create Themes
    const themes = [
      {
        name: "Coding Basics",
        description: "Learn programming fundamentals.",
        intentId: intentIds["SkillBoost (Skills)"],
      },
      {
        name: "Politics & Governance",
        description: "News about politics and governance.",
        intentId: intentIds["Headline (News)"],
      },
      {
        name: "Movies",
        description: "Latest movies, trailers, and reviews.",
        intentId: intentIds["Spotlight (Entertainment World)"],
      },
      {
        name: "Biographies",
        description: "Stories of prominent achievers.",
        intentId: intentIds["Inspire (Success Stories)"],
      },
      {
        name: "Daily Motivation",
        description: "Start your day with positivity.",
        intentId: intentIds["Drive (Motivational Content)"],
      },
    ];

    const themeIds = {};
    for (const themeData of themes) {
      const theme = await Theme.create(themeData);
      themeIds[theme.name] = theme._id;
    }

    console.log("Themes created:", themeIds);

    // Step 3: Create Subjects
    const subjects = [
      {
        name: "MySQL Tutorials",
        description: "Learn the basics of MySQL.",
        theme: themeIds["Coding Basics"],
      },
      {
        name: "JavaScript Basics",
        description: "Start with JavaScript programming.",
        theme: themeIds["Coding Basics"],
      },
      {
        name: "Upcoming Elections",
        description: "Updates about upcoming elections.",
        theme: themeIds["Politics & Governance"],
      },
      {
        name: "Bollywood Celebrities",
        description: "Get the latest Bollywood news.",
        theme: themeIds["Movies"],
      },
      {
        name: "Local Heroes",
        description: "Inspirational stories from local heroes.",
        theme: themeIds["Biographies"],
      },
    ];

    const subjectIds = {};
    for (const subjectData of subjects) {
      const subject = await Subject.create(subjectData);
      subjectIds[subject.name] = subject._id;
    }

    console.log("Subjects created:", subjectIds);

    // Step 4: Create Sets
    const sets = [
      {
        name: "Basic Commands and Concepts",
        description: "Learn foundational MySQL commands.",
        subject: subjectIds["MySQL Tutorials"],
      },
      {
        name: "JavaScript Syntax",
        description: "Understand the syntax of JavaScript.",
        subject: subjectIds["JavaScript Basics"],
      },
      {
        name: "Election Analysis",
        description: "Analyze election trends and data.",
        subject: subjectIds["Upcoming Elections"],
      },
      {
        name: "Actor Interviews",
        description: "Read in-depth interviews of Bollywood actors.",
        subject: subjectIds["Bollywood Celebrities"],
      },
      {
        name: "Farmers' Stories",
        description: "Learn from inspiring stories of farmers.",
        subject: subjectIds["Local Heroes"],
      },
    ];

    for (const setData of sets) {
      await Set.create(setData);
    }

    console.log("Sets created successfully");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.disconnect();
  }
};

seedDatabase();
