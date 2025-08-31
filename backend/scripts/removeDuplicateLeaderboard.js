const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');

async function removeDuplicates() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mlrit-code-hub');
    console.log('Connected to MongoDB');

    // Find duplicate entries
    const duplicates = await Leaderboard.aggregate([
      {
        $group: {
          _id: { userId: '$userId', courseId: '$courseId' },
          count: { $sum: 1 },
          docs: { $push: { id: '$_id', score: '$overallScore', updated: '$lastUpdated' } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`Found ${duplicates.length} duplicate user/course combinations`);

    for (const duplicate of duplicates) {
      console.log(`Processing duplicates for user ${duplicate._id.userId} in course ${duplicate._id.courseId}`);
      
      // Sort by score (desc) then by lastUpdated (desc) to keep the best/latest entry
      const sortedDocs = duplicate.docs.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.updated) - new Date(a.updated);
      });

      // Keep the first (best) entry, delete the rest
      const toDelete = sortedDocs.slice(1).map(doc => doc.id);
      
      if (toDelete.length > 0) {
        await Leaderboard.deleteMany({ _id: { $in: toDelete } });
        console.log(`Deleted ${toDelete.length} duplicate entries, kept entry with score ${sortedDocs[0].score}`);
      }
    }

    console.log('Duplicate removal completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error removing duplicates:', error);
    await mongoose.disconnect();
  }
}

removeDuplicates();
