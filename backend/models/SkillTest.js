const mongoose = require("mongoose");
const SkillTestSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number,
  type: { type: String, enum: ["mcq", "code"] },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  questions: [Object],
  codingProblems: [Object],
});
module.exports = mongoose.model("SkillTest", SkillTestSchema); 