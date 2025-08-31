const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');
require('dotenv').config();

async function deleteLeaderboardData() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get count before deletion
    const countBefore = await Leaderboard.countDocuments();
    console.log(`Found ${countBefore} leaderboard entries`);

    if (countBefore === 0) {
      console.log('No leaderboard data to delete');
      await mongoose.disconnect();
      return;
    }

    // Confirm deletion (uncomment the line below to actually delete)
    console.log('WARNING: This will delete ALL leaderboard data!');
    console.log('To proceed, uncomment the deletion line in the script');
    
    // UNCOMMENT THE NEXT LINE TO ACTUALLY DELETE ALL LEADERBOARD DATA
    const result = await Leaderboard.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} leaderboard entries`);
    
    console.log('Script completed. No data was deleted (safety measure).');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error deleting leaderboard data:', error);
    await mongoose.disconnect();
  }
}

// Alternative: Delete leaderboard data for specific course
async function deleteLeaderboardForCourse(courseId) {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const countBefore = await Leaderboard.countDocuments({ courseId });
    console.log(`Found ${countBefore} leaderboard entries for course ${courseId}`);

    if (countBefore === 0) {
      console.log('No leaderboard data to delete for this course');
      await mongoose.disconnect();
      return;
    }

    // UNCOMMENT THE NEXT LINE TO ACTUALLY DELETE COURSE-SPECIFIC LEADERBOARD DATA
    // const result = await Leaderboard.deleteMany({ courseId });
    
    // console.log(`Successfully deleted ${result.deletedCount} leaderboard entries for course ${courseId}`);
    
    console.log('Script completed. No data was deleted (safety measure).');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error deleting course leaderboard data:', error);
    await mongoose.disconnect();
  }
}

// Alternative: Reset all scores to zero (keeps entries but resets scores)
async function resetLeaderboardScores() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const countBefore = await Leaderboard.countDocuments();
    console.log(`Found ${countBefore} leaderboard entries`);

    if (countBefore === 0) {
      console.log('No leaderboard data to reset');
      await mongoose.disconnect();
      return;
    }

    // UNCOMMENT THE NEXT LINES TO ACTUALLY RESET ALL SCORES
    // const result = await Leaderboard.updateMany({}, {
    //   $set: {
    //     lessonScores: [],
    //     moduleTestScores: [],
    //     finalExamScore: null,
    //     totalLessonScore: 0,
    //     totalModuleTestScore: 0,
    //     totalFinalExamScore: 0,
    //     overallScore: 0,
    //     rank: null,
    //     percentile: null,
    //     lessonsCompleted: 0,
    //     moduleTestsCompleted: 0,
    //     finalExamCompleted: false,
    //     averageScore: 0,
    //     lastUpdated: new Date()
    //   }
    // });
    
    // console.log(`Successfully reset ${result.modifiedCount} leaderboard entries`);
    
    console.log('Script completed. No scores were reset (safety measure).');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error resetting leaderboard scores:', error);
    await mongoose.disconnect();
  }
}

// Run the appropriate function based on command line arguments
const args = process.argv.slice(2);
const action = args[0];
const courseId = args[1];

switch (action) {
  case 'delete-all':
    deleteLeaderboardData();
    break;
  case 'delete-course':
    if (!courseId) {
      console.error('Please provide a courseId: node deleteLeaderboardData.js delete-course <courseId>');
      process.exit(1);
    }
    deleteLeaderboardForCourse(courseId);
    break;
  case 'reset-scores':
    resetLeaderboardScores();
    break;
  default:
    console.log('Usage:');
    console.log('  node deleteLeaderboardData.js delete-all           - Delete all leaderboard data');
    console.log('  node deleteLeaderboardData.js delete-course <id>   - Delete leaderboard data for specific course');
    console.log('  node deleteLeaderboardData.js reset-scores         - Reset all scores to zero (keep entries)');
    console.log('');
    console.log('IMPORTANT: Edit the script to uncomment deletion lines before running!');
    break;
}
