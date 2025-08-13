const express = require("express");
const router = express.Router();
const SkillTest = require("../models/SkillTest");

router.get("/", async (req, res) => {
  const tests = await SkillTest.find();
  res.json(tests);
});

router.get("/:id", async (req, res) => {
  const test = await SkillTest.findById(req.params.id);
  res.json(test);
});

module.exports = router; 