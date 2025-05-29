const Submission = require("../models/Submission");
const User = require("../models/user");

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      { $match: { isSuccess: true } },
      {
        $group: {
          _id: "$user",
          successCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          name: "$userDetails.name",
          email: "$userDetails.email",
          successCount: 1,
        },
      },
      { $sort: { successCount: -1 } },
    ]);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
};

module.exports = { getLeaderboard };
