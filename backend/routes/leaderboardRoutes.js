const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const User = require("../models/user");

router.get("/", async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      { $match: { isSuccess: true } },
      {
        $group: {
          _id: "$user",
          totalSolved: { $addToSet: "$problem" }, // unique problems
          language: { $first: "$language" }, // capture the first language used for submission
        },
      },
      {
        $project: {
          userId: "$_id",
          totalSolved: { $size: "$totalSolved" },
          language: 1, // Include language field in the results
        },
      },
      { $sort: { totalSolved: -1 } },
      { $limit: 20 },
    ]);

    // populate usernames
    const users = await User.find({
      _id: { $in: leaderboard.map((l) => l.userId) },
    }).select("name");

    const merged = leaderboard.map((entry, idx) => {
      const user = users.find((u) => u._id.toString() === entry.userId.toString());
      return {
        rank: idx + 1,
        name: user?.name || "Unknown",
        score: entry.totalSolved * 100, // score logic
        totalSolved: entry.totalSolved,
        language: entry.language || "Not Provided", // Display language from submission
      };
    });

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
