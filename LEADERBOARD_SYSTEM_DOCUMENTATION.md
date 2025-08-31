# Course Leaderboard System Documentation

## Overview
The MLRIT Code Hub now features a comprehensive leaderboard system that tracks student performance across lessons, module tests, and final exams. The system provides real-time rankings, detailed statistics, and performance analytics.

## Features Implemented

### 1. Backend Components

#### Models
- **Leaderboard.js**: Tracks user scores, ranks, and detailed performance metrics
- **Course.js**: Enhanced with scoring configuration for different assessment types
- **UserProgress.js**: Updated to track detailed scoring data

#### Controllers
- **courseLeaderboardController.js**: Handles course-specific leaderboard operations
- **leaderboardController.js**: Manages overall leaderboard functionality

#### Routes
- **courseLeaderboardRoutes.js**: Course-specific leaderboard endpoints
- **leaderboardRoutes.js**: General leaderboard endpoints

### 2. Frontend Components

#### LeaderboardSection.js
- Two-tab interface: Rankings and My Stats
- Real-time leaderboard display with rank icons
- Detailed performance breakdown
- Error handling and loading states

#### Integration
- Replaced Progress tab with Leaderboard tab in course details
- Added scoring configuration to admin course creation

## API Endpoints

### Course Leaderboard
- `GET /api/course-leaderboard/:courseId` - Get course leaderboard
- `GET /api/course-leaderboard/:courseId/user/:userId/rank` - Get user rank
- `GET /api/course-leaderboard/:courseId/user/:userId/stats` - Get user stats
- `POST /api/course-leaderboard/:courseId/update-score` - Update user score

### General Leaderboard
- `GET /api/leaderboard` - Get overall leaderboard
- `GET /api/leaderboard/user/:userId/rank` - Get user rank across all courses
- `GET /api/leaderboard/user/:userId/stats` - Get detailed user statistics

## Scoring System

### Configuration
Admins can configure marks per question type during course creation:
- **Lessons**: MCQ marks, Coding challenge marks
- **Module Tests**: MCQ marks, Coding challenge marks  
- **Final Exams**: MCQ marks, Coding challenge marks

### Score Calculation
- **MCQs**: Points awarded only for correct answers
- **Coding**: Points awarded only for "Accepted" verdict
- **Overall Score**: Sum of lesson scores + module test scores + final exam score

### Ranking
- Users ranked by overall score (descending)
- Percentile calculation based on position in leaderboard
- Automatic rank updates when scores change

## Integration Points

### Assessment Completion
The system automatically updates leaderboard scores when:
1. **Lesson Completion**: Via `/api/progress/lesson` endpoint
2. **Module Test Submission**: Via `/api/progress/module-test` endpoint
3. **Final Exam Submission**: Via `/api/courses/:courseId/final-exam/submit` endpoint

### Error Handling
- Graceful fallback if leaderboard update fails
- Default entries created for new users
- Comprehensive error states in frontend

## UI Features

### Rankings View
- Top 3 users with special crown/medal icons
- User details with roll number and department
- Score breakdown and progress indicators
- Current user highlighting

### My Stats View
- Performance overview with key metrics
- Score breakdown by assessment type
- Performance analysis and insights
- Progress tracking

## Database Schema

### Leaderboard Document
```javascript
{
  userId: ObjectId,
  courseId: ObjectId,
  overallScore: Number,
  rank: Number,
  percentile: Number,
  breakdown: {
    lessonScore: Number,
    moduleTestScore: Number,
    finalExamScore: Number
  },
  performance: {
    averageScore: Number,
    strongestArea: String, // 'MCQ' or 'Coding'
    completionRate: Number
  },
  progress: {
    lessonsCompleted: Number,
    moduleTestsCompleted: Number,
    finalExamCompleted: Boolean
  }
}
```

## Security
- All endpoints protected with authentication middleware
- User data access restricted to authenticated users
- Score updates only through internal API calls

## Performance Considerations
- Efficient MongoDB aggregation pipelines
- Indexed queries for fast leaderboard retrieval
- Batch rank updates to minimize database operations

## Future Enhancements
- Pagination for large leaderboards
- Real-time updates via WebSocket
- Advanced filtering and search
- Historical performance tracking
- Achievement badges and milestones

## Testing
The system has been integrated with existing assessment flows and includes:
- Error handling for edge cases
- Graceful degradation if services fail
- Comprehensive frontend error states
- Default data creation for new users

## Usage
1. **Admin**: Configure scoring during course creation
2. **Students**: View leaderboard in course detail page
3. **System**: Automatic score updates on assessment completion
4. **Monitoring**: Check logs for leaderboard update errors
