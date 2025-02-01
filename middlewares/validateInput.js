exports.validatePreferences = (req, res, next) => {
  const { userId, intents, themes } = req.body;

  if (!userId || !Array.isArray(intents) || !Array.isArray(themes)) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  next();
};
