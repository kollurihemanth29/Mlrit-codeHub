const Submission = require("../models/Submission");
const User = require("../models/user");
const Problem = require("../models/Problem");

const getLeaderboard = async (req, res) => {
  try {
    // Get the requesting user's college
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const college = user.college;
    if (!college) return res.status(400).json({ message: "User college not set" });

    // Find all users in the same college
    const usersInCollege = await User.find({ college }).select("_id");
    const userIds = usersInCollege.map(u => u._id);

    // Aggregate leaderboard for users in the same college only
    const leaderboard = await Submission.aggregate([
      { $match: { isSuccess: true, user: { $in: userIds } } },
      // Only count the first successful submission per problem per user
      { $group: { _id: { user: "$user", problem: "$problem" }, submissionId: { $first: "$_id" } } },
      // Group by user and collect unique problems
      { $group: { _id: "$_id.user", problems: { $addToSet: "$_id.problem" } } },
      // Lookup problem scores
      { $lookup: { from: "problems", localField: "problems", foreignField: "_id", as: "problemDetails" } },
      // Sum the scores
      { $addFields: { totalScore: { $sum: "$problemDetails.score" }, totalSolved: { $size: "$problems" } } },
      // Lookup user details
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
      { $unwind: "$userDetails" },
      { $project: { 
        name: "$userDetails.name", 
        email: "$userDetails.email", 
        college: "$userDetails.college", 
        rollNumber: "$userDetails.rollNumber", 
        year: "$userDetails.year", 
        department: "$userDetails.department", 
        totalScore: 1, 
        totalSolved: 1 
      } },
      { $sort: { totalScore: -1 } },
    ]);

    // Add rank field
    leaderboard.forEach((entry, idx) => { entry.rank = idx + 1; });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
};

module.exports = { getLeaderboard };
