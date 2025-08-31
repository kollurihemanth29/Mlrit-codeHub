const mongoose = require('mongoose');
const Course = require('./models/Course');
const SkillTest = require('./models/SkillTest');
require('dotenv').config();

// Configure mongoose connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 30000,
  connectTimeoutMS: 30000
};

// Connect to MongoDB with better error handling
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'Found' : 'Not found in .env');
    
    await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    console.log('✅ Connected to MongoDB successfully');
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

const pythonCourseData = {
  title: "Complete Python Programming",
  description: "Master Python programming from basics to advanced concepts with hands-on coding exercises, comprehensive tests, and real-world projects.",
  difficulty: "Medium",
  duration: "8 weeks",
  instructor: "Dr. Sarah Johnson",
  tags: ["Python", "Programming", "Backend", "Data Science", "Web Development"],
  prerequisites: ["Basic computer knowledge", "Logical thinking"],
  learningOutcomes: [
    "Master Python syntax and fundamentals",
    "Build real-world applications",
    "Understand object-oriented programming",
    "Work with data structures and algorithms",
    "Create web applications with Flask/Django"
  ],
  
  // Scoring Configuration
  scoringConfig: {
    lessons: { mcqMarks: 5, codingMarks: 10 },
    moduleTests: { mcqMarks: 10, codingMarks: 20 },
    finalExam: { mcqMarks: 15, codingMarks: 25 }
  },

  topics: [
    {
      title: "Python Basics",
      description: "Introduction to Python programming language",
      order: 1,
      lessons: [
        {
          title: "Introduction to Python",
          description: "Learn what Python is and why it's popular",
          order: 1,
          type: "lesson",
          content: `# Introduction to Python

Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, Python has become one of the most popular programming languages in the world.

## Why Python?

1. **Easy to Learn**: Python's syntax is clean and intuitive
2. **Versatile**: Used in web development, data science, AI, automation
3. **Large Community**: Extensive libraries and community support
4. **Cross-platform**: Runs on Windows, Mac, Linux

## Python Applications

- **Web Development**: Django, Flask
- **Data Science**: NumPy, Pandas, Matplotlib
- **Machine Learning**: TensorFlow, PyTorch, Scikit-learn
- **Automation**: Selenium, Beautiful Soup
- **Desktop Applications**: Tkinter, PyQt

## Getting Started

Python code is executed line by line by the Python interpreter. You can run Python code in:
- Interactive shell (REPL)
- Script files (.py)
- Jupyter notebooks
- Online IDEs

Let's start with a simple "Hello, World!" program:

\`\`\`python
print("Hello, World!")
\`\`\`

This single line of code demonstrates Python's simplicity compared to other languages.`,
          mcqs: [
            {
              question: "Who created the Python programming language?",
              options: ["James Gosling", "Guido van Rossum", "Brendan Eich", "Dennis Ritchie"],
              correct: 1,
              explanation: "Guido van Rossum created Python in 1991.",
              marks: 2,
              difficulty: "easy"
            },
            {
              question: "Which of the following is NOT a common use case for Python?",
              options: ["Web Development", "Data Science", "System Programming", "Mobile App Development"],
              correct: 3,
              explanation: "While possible, Python is not commonly used for mobile app development compared to other languages.",
              marks: 3,
              difficulty: "medium"
            }
          ],
          codeChallenges: [
            {
              title: "Hello World",
              description: "Write a Python program that prints 'Hello, Python!' to the console.",
              starterCode: "# Write your code here\n",
              expectedOutput: "Hello, Python!",
              testCases: [
                { input: "", expectedOutput: "Hello, Python!" }
              ],
              marks: 5,
              difficulty: "easy",
              timeLimit: 60,
              points: 10
            },
            {
              title: "Personal Greeting",
              description: "Write a program that prints 'Welcome to Python, [Your Name]!' where [Your Name] is replaced with your actual name.",
              starterCode: "# Replace 'Your Name' with your actual name\nname = \"Your Name\"\n# Write your code here\n",
              expectedOutput: "Welcome to Python, John!",
              testCases: [
                { input: "", expectedOutput: "Welcome to Python, John!" }
              ],
              marks: 7,
              difficulty: "easy",
              timeLimit: 90
            }
          ],
          review: "You've learned the basics of Python and its applications. Python's simplicity makes it an excellent choice for beginners and professionals alike. Key points: Python is easy to learn and read, it's used in many domains like web dev, data science, AI, Python code is executed by an interpreter, and the print() function displays output to the console."
        },
        {
          title: "Variables and Data Types",
          description: "Learn about Python variables and basic data types",
          order: 2,
          type: "lesson",
          content: `# Variables and Data Types

Variables are containers that store data values. In Python, you don't need to declare variables explicitly - they are created when you assign a value.

## Variable Assignment

\`\`\`python
name = "Alice"
age = 25
height = 5.6
is_student = True
\`\`\`

## Basic Data Types

### 1. Numbers
- **int**: Whole numbers (e.g., 42, -17, 0)
- **float**: Decimal numbers (e.g., 3.14, -2.5, 0.0)

\`\`\`python
count = 10        # int
price = 19.99     # float
\`\`\`

### 2. Strings
Text data enclosed in quotes (single or double)

\`\`\`python
message = "Hello, World!"
name = 'Python'
\`\`\`

### 3. Boolean
True or False values

\`\`\`python
is_active = True
is_complete = False
\`\`\`

## Variable Naming Rules

1. Must start with a letter or underscore
2. Can contain letters, numbers, and underscores
3. Case-sensitive (age and Age are different)
4. Cannot use Python keywords

### Good Examples:
\`\`\`python
user_name = "john"
total_count = 100
_private_var = "secret"
\`\`\`

### Bad Examples:
\`\`\`python
2name = "invalid"     # starts with number
class = "invalid"     # Python keyword
user-name = "invalid" # contains hyphen
\`\`\`

## Type Checking

Use the \`type()\` function to check variable types:

\`\`\`python
print(type(42))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("hello"))   # <class 'str'>
print(type(True))      # <class 'bool'>
\`\`\``,
          mcqs: [
            {
              question: "What is the correct way to declare a variable in Python?",
              options: ["var x = 5", "int x = 5", "x = 5", "declare x = 5"],
              correct: 2,
              explanation: "Python uses dynamic typing, so you simply assign a value to a variable name.",
              marks: 2,
              difficulty: "easy"
            },
            {
              question: "Which of the following is NOT a valid Python data type?",
              options: ["int", "float", "string", "boolean"],
              correct: 3,
              explanation: "In Python, the boolean type is called 'bool', not 'boolean'.",
              marks: 3,
              difficulty: "medium"
            }
          ],
          codeChallenges: [
            {
              title: "Variable Assignment",
              description: "Create variables for your name, age, and height, then print them.",
              starterCode: "# Create variables here\nname = \"\"\nage = \nheight = \n\n# Print them here\n",
              expectedOutput: "Name: John\nAge: 25\nHeight: 5.9",
              testCases: [
                { input: "", expectedOutput: "Name: John\nAge: 25\nHeight: 5.9" }
              ],
              marks: 8,
              difficulty: "easy",
              timeLimit: 120
            },
            {
              title: "Type Conversion",
              description: "Convert a string number to integer and perform arithmetic.",
              starterCode: "# Given string\nnum_str = \"42\"\n\n# Convert and calculate\n",
              expectedOutput: "84",
              testCases: [
                { input: "", expectedOutput: "84" }
              ],
              marks: 10,
              difficulty: "medium",
              timeLimit: 150
            }
          ],
          review: "Variables store data and Python has several basic data types: int, float, str, and bool. Variable names must follow specific rules. Key points: Variables are created when you assign values, Python has int, float, str, and bool data types, variable names must start with letter or underscore, and use type() function to check data types."
        }
      ],
      moduleTest: {
        title: "Python Basics Test",
        description: "Test your understanding of Python fundamentals",
        duration: 30,
        totalMarks: 60,
        mcqs: [
          {
            question: "What will be the output of: print(type(10/2))",
            options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "Error"],
            correct: 1,
            marks: 10,
            explanation: "Division (/) always returns a float in Python 3, even if the result is a whole number."
          },
          {
            question: "Which of the following will cause a syntax error?",
            options: ["name = 'John'", "2var = 10", "_count = 5", "user_age = 25"],
            correct: 1,
            marks: 10,
            explanation: "Variable names cannot start with a number."
          },
          {
            question: "What is the correct way to create a string variable?",
            options: ["name = John", "name = 'John'", "name = (John)", "name = [John]"],
            correct: 1,
            marks: 10,
            explanation: "Strings must be enclosed in quotes (single or double)."
          }
        ],
        codeChallenges: [
          {
            title: "Variable Calculator",
            description: "Create variables a=10 and b=5. Calculate and print their sum, difference, and product.",
            starterCode: "# Create variables a and b\n# Calculate sum, difference, and product\n# Print the results\n",
            expectedOutput: "15\n5\n50",
            testCases: [
              { input: "", expectedOutput: "15\n5\n50" }
            ],
            marks: 15,
            difficulty: "Easy"
          },
          {
            title: "String Manipulation",
            description: "Create a variable with your name and print 'Hello, [name]!' where [name] is your variable.",
            starterCode: "# Create name variable\n# Print greeting message\n",
            expectedOutput: "Hello, Alice!",
            testCases: [
              { input: "", expectedOutput: "Hello, Alice!" }
            ],
            marks: 15,
            difficulty: "Easy"
          }
        ]
      }
    },
    {
      title: "Control Structures",
      description: "Learn about conditional statements and loops",
      order: 2,
      lessons: [
        {
          title: "If Statements",
          description: "Learn conditional logic with if, elif, and else",
          order: 1,
          type: "lesson",
          content: `# If Statements and Conditional Logic

Conditional statements allow your program to make decisions based on different conditions. Python uses \`if\`, \`elif\`, and \`else\` keywords.

## Basic If Statement

\`\`\`python
age = 18
if age >= 18:
    print("You are an adult")
\`\`\`

## If-Else Statement

\`\`\`python
temperature = 25
if temperature > 30:
    print("It's hot outside")
else:
    print("It's not too hot")
\`\`\`

## If-Elif-Else Statement

\`\`\`python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
\`\`\`

## Comparison Operators

- \`==\` : Equal to
- \`!=\` : Not equal to
- \`>\` : Greater than
- \`<\` : Less than
- \`>=\` : Greater than or equal to
- \`<=\` : Less than or equal to

## Logical Operators

- \`and\` : Both conditions must be True
- \`or\` : At least one condition must be True
- \`not\` : Reverses the boolean value

\`\`\`python
age = 25
has_license = True

if age >= 18 and has_license:
    print("Can drive")
elif age >= 18 and not has_license:
    print("Can get a license")
else:
    print("Too young to drive")
\`\`\`

## Indentation

Python uses indentation (spaces or tabs) to define code blocks. All statements at the same indentation level belong to the same block.

\`\`\`python
if True:
    print("This is indented")
    print("This is also indented")
print("This is not indented")
\`\`\``,
          mcqs: [
            {
              question: "What will be printed if x = 5?\n\nif x > 10:\n    print('A')\nelif x > 3:\n    print('B')\nelse:\n    print('C')",
              options: ["A", "B", "C", "Nothing"],
              correct: 1,
              explanation: "Since x=5 is not > 10 but is > 3, the elif condition is True and 'B' is printed."
            },
            {
              question: "Which operator checks if two values are equal?",
              options: ["=", "==", "!=", "==="],
              correct: 1,
              explanation: "== is the equality operator in Python. = is for assignment."
            }
          ],
          codeChallenges: [
            {
              title: "Age Checker",
              description: "Write a program that checks if a person can vote. If age >= 18, print 'Can vote', otherwise print 'Cannot vote'.",
              starterCode: "age = 16\n# Write your if-else statement here\n",
              expectedOutput: "Cannot vote",
              testCases: [
                { input: "", expectedOutput: "Cannot vote" }
              ],
              difficulty: "Easy",
              points: 10
            },
            {
              title: "Grade Calculator",
              description: "Write a program that assigns grades based on score: A (90+), B (80-89), C (70-79), F (below 70).",
              starterCode: "score = 85\n# Write your if-elif-else statement here\n",
              expectedOutput: "Grade: B",
              testCases: [
                { input: "", expectedOutput: "Grade: B" }
              ],
              difficulty: "Medium",
              points: 10
            }
          ],
          review: "Conditional statements control program flow based on conditions. Use if, elif, and else with proper indentation. Key points: if statements execute code based on conditions, elif allows multiple conditions to be checked, else provides a default case, and indentation defines code blocks in Python."
        }
      ],
      moduleTest: {
        title: "Control Structures Test",
        description: "Test your understanding of conditional statements and loops",
        duration: 45,
        totalMarks: 80,
        mcqs: [
          {
            question: "What is the output of the following code?\n\nx = 10\nif x > 5:\n    if x < 15:\n        print('Medium')\n    else:\n        print('Large')\nelse:\n    print('Small')",
            options: ["Small", "Medium", "Large", "Error"],
            correct: 1,
            marks: 15,
            explanation: "x=10 is > 5 and < 15, so 'Medium' is printed."
          },
          {
            question: "Which logical operator returns True if both conditions are True?",
            options: ["or", "and", "not", "xor"],
            correct: 1,
            marks: 15,
            explanation: "The 'and' operator returns True only when both conditions are True."
          }
        ],
        codeChallenges: [
          {
            title: "Number Classifier",
            description: "Write a program that classifies a number as positive, negative, or zero.",
            starterCode: "number = -5\n# Write your classification logic here\n",
            expectedOutput: "Negative",
            testCases: [
              { input: "", expectedOutput: "Negative" }
            ],
            marks: 25,
            difficulty: "Easy"
          },
          {
            title: "Login System",
            description: "Create a simple login system. Check if username='admin' and password='123'. Print 'Login successful' or 'Login failed'.",
            starterCode: "username = 'admin'\npassword = '123'\n# Write your login logic here\n",
            expectedOutput: "Login successful",
            testCases: [
              { input: "", expectedOutput: "Login successful" }
            ],
            marks: 25,
            difficulty: "Medium"
          }
        ]
      }
    }
  ],


  testUnlockThreshold: 75,
  enrolledUsers: [],
  enrolledCount: 0,
  isActive: true
};

// Final exam data (separate from course)
const finalExamData = {
  title: "Python Programming Final Exam",
  description: "Comprehensive test covering all Python concepts learned in the course",
  duration: 120,
  totalMarks: 330,
  passingScore: 140,
  isFinalExam: true,
  type: 'final_exam',
  isActive: true,
  securitySettings: {
    fullScreen: true,
    copyPaste: false,
    rightClick: false,
    tabSwitch: false
  },
  questions: [
    {
      question: "What is the correct way to define a function in Python?",
      options: [
        "function myFunc():",
        "def myFunc():",
        "define myFunc():",
        "func myFunc():"
      ],
      correct: 1,
      marks: 15,
      explanation: "Functions in Python are defined using the 'def' keyword."
    },
    {
      question: "Which of the following is used to handle exceptions in Python?",
      options: [
        "try-catch",
        "try-except",
        "catch-throw",
        "handle-error"
      ],
      correct: 1,
      marks: 15,
      explanation: "Python uses try-except blocks for exception handling."
    },
    {
      question: "What does the len() function return for the string 'Hello'?",
      options: ["4", "5", "6", "Error"],
      correct: 1,
      marks: 15,
      explanation: "len() returns the number of characters in a string. 'Hello' has 5 characters."
    },
    {
      question: "Which data structure is ordered and mutable in Python?",
      options: ["tuple", "set", "list", "dictionary"],
      correct: 2,
      marks: 15,
      explanation: "Lists are ordered and mutable (can be changed after creation)."
    },
    {
      question: "What is the output of: print(type([1, 2, 3]))?",
      options: ["<class 'tuple'>", "<class 'list'>", "<class 'array'>", "<class 'set'>"],
      correct: 1,
      marks: 15,
      explanation: "[1, 2, 3] creates a list, so type() returns <class 'list'>."
    },
    {
      question: "Which keyword is used to create a loop that continues until a condition is False?",
      options: ["for", "while", "loop", "repeat"],
      correct: 1,
      marks: 15,
      explanation: "The 'while' keyword creates a loop that continues while a condition is True."
    },
    {
      question: "What is the correct way to add an element to the end of a list?",
      options: ["list.add(item)", "list.append(item)", "list.insert(item)", "list.push(item)"],
      correct: 1,
      marks: 15,
      explanation: "The append() method adds an element to the end of a list."
    },
    {
      question: "Which operator is used for floor division in Python?",
      options: ["/", "//", "%", "**"],
      correct: 1,
      marks: 15,
      explanation: "The // operator performs floor division, returning the largest integer less than or equal to the result."
    },
    {
      question: "What is the correct way to create a dictionary in Python?",
      options: ["{key: value}", "[key: value]", "(key: value)", "<key: value>"],
      correct: 0,
      marks: 15,
      explanation: "Dictionaries are created using curly braces {} with key: value pairs."
    },
    {
      question: "Which method is used to remove whitespace from both ends of a string?",
      options: ["strip()", "trim()", "clean()", "remove()"],
      correct: 0,
      marks: 15,
      explanation: "The strip() method removes whitespace from both ends of a string."
    }
  ],
  codingProblems: [
    {
      title: "Fibonacci Sequence",
      description: "Write a function that returns the nth Fibonacci number. The sequence starts with 0, 1, 1, 2, 3, 5, 8...",
      starterCode: "def fibonacci(n):\n    # Write your code here\n    pass\n\n# Test\nprint(fibonacci(6))  # Should print 8",
      expectedOutput: "8",
      testCases: [
        { input: "6", expectedOutput: "8" },
        { input: "0", expectedOutput: "0" },
        { input: "1", expectedOutput: "1" }
      ],
      marks: 40,
      difficulty: "Medium"
    },
    {
      title: "Word Counter",
      description: "Write a function that counts the number of words in a given string.",
      starterCode: "def count_words(text):\n    # Write your code here\n    pass\n\n# Test\nprint(count_words('Hello world Python'))  # Should print 3",
      expectedOutput: "3",
      testCases: [
        { input: "'Hello world Python'", expectedOutput: "3" },
        { input: "'Python'", expectedOutput: "1" },
        { input: "''", expectedOutput: "0" }
      ],
      marks: 30,
      difficulty: "Easy"
    },
    {
      title: "List Operations",
      description: "Write a function that takes a list of numbers and returns a new list with only even numbers, sorted in ascending order.",
      starterCode: "def filter_even_numbers(numbers):\n    # Write your code here\n    pass\n\n# Test\nprint(filter_even_numbers([3, 8, 1, 6, 2, 9]))  # Should print [2, 6, 8]",
      expectedOutput: "[2, 6, 8]",
      testCases: [
        { input: "[3, 8, 1, 6, 2, 9]", expectedOutput: "[2, 6, 8]" },
        { input: "[1, 3, 5]", expectedOutput: "[]" },
        { input: "[2, 4, 6]", expectedOutput: "[2, 4, 6]" }
      ],
      marks: 50,
      difficulty: "Hard"
    },
    {
      title: "Prime Number Checker",
      description: "Write a function that checks if a given number is prime. Return True if prime, False otherwise.",
      starterCode: "def is_prime(n):\n    # Write your code here\n    pass\n\n# Test\nprint(is_prime(17))  # Should print True",
      expectedOutput: "True",
      testCases: [
        { input: "17", expectedOutput: "True" },
        { input: "4", expectedOutput: "False" },
        { input: "2", expectedOutput: "True" }
      ],
      marks: 35,
      difficulty: "Medium"
    },
    {
      title: "String Reverser",
      description: "Write a function that reverses a string without using built-in reverse methods.",
      starterCode: "def reverse_string(s):\n    # Write your code here\n    pass\n\n# Test\nprint(reverse_string('hello'))  # Should print 'olleh'",
      expectedOutput: "olleh",
      testCases: [
        { input: "'hello'", expectedOutput: "olleh" },
        { input: "'python'", expectedOutput: "nohtyp" },
        { input: "'a'", expectedOutput: "a" }
      ],
      marks: 25,
      difficulty: "Easy"
    }
  ],
  attempts: []
};

async function seedPythonCourse() {
  try {
    // First, ensure MongoDB connection
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('❌ Failed to connect to MongoDB. Please ensure:');
      console.error('1. MongoDB server is running');
      console.error('2. MONGO_URI is correctly set in .env file');
      console.error('3. Network connectivity is available');
      process.exit(1);
    }

    console.log('🔄 Starting course seeding process...');

    // Check if course already exists
    console.log('🔍 Checking for existing Python course...');
    const existingCourse = await Course.findOne({ title: "Complete Python Programming" }).maxTimeMS(10000);
    if (existingCourse) {
      console.log('⚠️  Python course already exists. Deleting and recreating...');
      await Course.deleteOne({ title: "Complete Python Programming" }).maxTimeMS(10000);
      await SkillTest.deleteMany({ courseId: existingCourse._id }).maxTimeMS(10000);
      console.log('✅ Existing course and related data deleted');
    }

    // Create the course
    console.log('🔄 Creating new Python course...');
    const course = new Course(pythonCourseData);
    await course.save();
    console.log('✅ Python course created successfully!');

    // Create the final exam as a separate SkillTest document
    console.log('🔄 Creating final exam...');
    const finalExamForSkillTest = {
      courseId: course._id,
      title: finalExamData.title,
      description: finalExamData.description,
      duration: finalExamData.duration,
      totalMarks: finalExamData.totalMarks,
      passingScore: finalExamData.passingScore,
      isFinalExam: finalExamData.isFinalExam,
      type: finalExamData.type,
      isActive: finalExamData.isActive,
      securitySettings: finalExamData.securitySettings,
      questions: finalExamData.questions,
      codingProblems: finalExamData.codingProblems,
      attempts: finalExamData.attempts
    };

    const finalExam = new SkillTest(finalExamForSkillTest);
    await finalExam.save();
    console.log('✅ Final exam created successfully!');

    console.log('\n🎉 Python course seeded successfully!');
    console.log('📊 Course Statistics:');
    console.log(`📚 Course ID: ${course._id}`);
    console.log(`📝 Final Exam ID: ${finalExam._id}`);
    console.log(`📖 Topics: ${course.topics.length}`);
    console.log(`📚 Total Lessons: ${course.topics.reduce((acc, topic) => acc + topic.lessons.length, 0)}`);
    console.log(`🧪 Module Tests: ${course.topics.filter(topic => topic.moduleTest).length}`);
    console.log(`🎯 Final Exam Questions: ${finalExam.questions.length}`);
    console.log(`💻 Coding Problems: ${finalExam.codingProblems.length}`);

    // Close connection and exit
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding Python course:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Close connection on error
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('❌ Error closing database connection:', closeError.message);
    }
    
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Process interrupted. Closing database connection...');
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
  process.exit(0);
});

// Start the seeding process
seedPythonCourse();
