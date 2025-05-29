// models/Leaderboard.js
const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalScore: { type: Number, default: 0 },
  rank:       { type: Number },
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
