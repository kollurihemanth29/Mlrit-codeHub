require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

const pythonCourseData = {
  "title": "Python Programming Fundamentals",
  "description": "Master the fundamentals of Python programming through hands-on exercises and real-world projects. Learn from basic syntax to advanced concepts.",
  "difficulty": "medium",
  "testUnlockThreshold": 80,
  "enrolledUsers": [],
  "enrolledCount": 0,
  "isActive": true,
  "topics": [
    {
      "title": "Output / Print in Python",
      "description": "Learn how to make Python print whatever you want, and learn to use it as a basic calculator.",
      "order": 1,
      "lessons": [
        {
          "title": "Introducing output / printing",
          "type": "lesson",
          "content": "The print() function is one of the most fundamental functions in Python. It allows you to display output on the screen. This is essential for debugging, showing results, and communicating with users.\n\n## Basic Syntax\n```python\nprint(\"Hello, World!\")\n```\n\nThe print function can display:\n- Text (strings)\n- Numbers\n- Variables\n- Multiple items at once\n\n## Examples:\n```python\nprint(\"Welcome to Python!\")\nprint(42)\nprint(3.14)\n```",
          "review": "Remember: print() is used to display output. Always use parentheses and quotes for text.",
          "mcqs": [
            {
              "question": "What is the correct way to print 'Hello World' in Python?",
              "options": [
                "print Hello World",
                "print('Hello World')",
                "echo 'Hello World'",
                "console.log('Hello World')"
              ],
              "correct": 1,
              "marks": 2,
              "difficulty": "easy",
              "explanation": "In Python, we use print() function with parentheses and quotes around text strings."
            },
            {
              "question": "Which character is used to create a new line in Python strings?",
              "options": [
                "\\t",
                "\\r",
                "\\n",
                "\\b"
              ],
              "correct": 2,
              "marks": 2,
              "difficulty": "easy",
              "explanation": "\\n is the newline character that moves the cursor to the next line."
            }
          ],
          "codeChallenges": [
            {
              "title": "Hello Python Basic",
              "description": "Write a program that prints 'Hello, Python!' to the console.",
              "sampleInput": "No input required",
              "sampleOutput": "Hello, Python!",
              "constraints": "Use exactly one print statement",
              "initialCode": "# Write your code here\n",
              "language": "python",
              "difficulty": "easy",
              "marks": 3,
              "testCases": [
                {
                  "input": "",
                  "expectedOutput": "Hello, Python!",
                  "isHidden": false
                }
              ]
            },
            {
              "title": "Print Multiple Lines",
              "description": "Write a program that prints your name and age on separate lines.",
              "sampleInput": "No input required",
              "sampleOutput": "John Doe\n25",
              "constraints": "Use exactly two print statements",
              "initialCode": "# Write your code here\nname = \"Your Name\"\nage = 0\n\n# Print name and age on separate lines\n",
              "language": "python",
              "difficulty": "easy",
              "marks": 3,
              "testCases": [
                {
                  "input": "",
                  "expectedOutput": "John Doe\n25",
                  "isHidden": false
                }
              ]
            }
          ],
          "order": 1,
          "duration": "15-20 min"
        }
      ],
      "moduleTest": {
        "mcqs": [
          {
            "question": "What will be the output of: print('Hello', 'World', sep='-')?",
            "options": [
              "Hello World",
              "Hello-World",
              "HelloWorld",
              "Hello,World"
            ],
            "correct": 1,
            "marks": 2,
            "difficulty": "medium",
            "explanation": "The sep parameter in print() specifies the separator between multiple arguments."
          },
          {
            "question": "Which of these will print numbers and text together correctly?",
            "options": [
              "print('Score: ' + 85)",
              "print('Score:', 85)",
              "print('Score: ', 85)",
              "Both B and C"
            ],
            "correct": 3,
            "marks": 2,
            "difficulty": "medium",
            "explanation": "Both comma separation and space-comma work for mixing text and numbers in print()."
          }
        ],
        "codeChallenges": [
          {
            "title": "Advanced Print Challenge",
            "description": "Write a program that prints a formatted message with name, age, and city.",
            "sampleInput": "No input required",
            "sampleOutput": "My name is Alice, I am 25 years old, and I live in New York.",
            "constraints": "Use f-string formatting",
            "initialCode": "# Write your code here\nname = \"Alice\"\nage = 25\ncity = \"New York\"\n\n# Print formatted message using f-string\n",
            "language": "python",
            "difficulty": "easy",
            "marks": 6,
            "testCases": [
              {
                "input": "",
                "expectedOutput": "My name is Alice, I am 25 years old, and I live in New York.",
                "isHidden": false
              }
            ]
          },
          {
            "title": "Multi-line Output",
            "description": "Create a program that prints a simple address format.",
            "sampleInput": "No input required",
            "sampleOutput": "John Smith\n123 Main St\nAnytown, USA 12345",
            "constraints": "Use newline characters or multiple print statements",
            "initialCode": "# Write your code here\n# Print a formatted address\n",
            "language": "python",
            "difficulty": "easy",
            "marks": 6,
            "testCases": [
              {
                "input": "",
                "expectedOutput": "John Smith\n123 Main St\nAnytown, USA 12345",
                "isHidden": false
              }
            ]
          }
        ],
        "totalMarks": 16
      }
    },
    {
      "title": "Variables and datatypes",
      "description": "Learn how to make Python store data and manipulate them",
      "order": 2,
      "lessons": [
        {
          "title": "Introduction to variables and datatypes",
          "type": "lesson",
          "content": "Variables are containers that store data values. Python has several built-in data types:\n\n## Creating Variables\n```python\nname = \"Alice\"        # String\nage = 25             # Integer\nheight = 5.8         # Float\nis_student = True    # Boolean\n```\n\n## Basic Data Types:\n1. **String (str)**: Text data\n2. **Integer (int)**: Whole numbers\n3. **Float (float)**: Decimal numbers\n4. **Boolean (bool)**: True or False\n\n## Checking Data Type\n```python\nprint(type(name))     # <class 'str'>\nprint(type(age))      # <class 'int'>\n```",
          "review": "Variables store data. Use type() to check data type. Python automatically determines the type.",
          "mcqs": [
            {
              "question": "Which is a valid variable name in Python?",
              "options": [
                "2name",
                "name-2",
                "name_2",
                "name 2"
              ],
              "correct": 2,
              "marks": 2,
              "difficulty": "easy",
              "explanation": "Variable names can contain letters, numbers, and underscores, but cannot start with a number or contain spaces/hyphens."
            },
            {
              "question": "What data type is the value True?",
              "options": [
                "string",
                "integer",
                "boolean",
                "float"
              ],
              "correct": 2,
              "marks": 2,
              "difficulty": "easy",
              "explanation": "True and False are boolean values in Python."
            }
          ],
          "codeChallenges": [
            {
              "title": "Variable Creation",
              "description": "Create variables for different data types and print their types.",
              "sampleInput": "No input required",
              "sampleOutput": "<class 'str'>\n<class 'int'>\n<class 'float'>\n<class 'bool'>",
              "constraints": "Create one variable of each basic type",
              "initialCode": "# Create variables of different types\nname = \"Python\"\nage = 30\nheight = 5.9\nis_active = True\n\n# Print their types\n",
              "language": "python",
              "difficulty": "easy",
              "marks": 3,
              "testCases": [
                {
                  "input": "",
                  "expectedOutput": "<class 'str'>\n<class 'int'>\n<class 'float'>\n<class 'bool'>",
                  "isHidden": false
                }
              ]
            },
            {
              "title": "Age Calculator",
              "description": "Create variables for birth year and current year, then calculate and print the age.",
              "sampleInput": "No input required",
              "sampleOutput": "Your age is: 25",
              "constraints": "Use variables and arithmetic operation",
              "initialCode": "# Create variables for birth year and current year\nbirth_year = 1998\ncurrent_year = 2023\n\n# Calculate age and print result\n",
              "language": "python",
              "difficulty": "easy",
              "marks": 3,
              "testCases": [
                {
                  "input": "",
                  "expectedOutput": "Your age is: 25",
                  "isHidden": false
                }
              ]
            }
          ],
          "order": 1,
          "duration": "20-25 min"
        }
      ],
      "moduleTest": {
        "mcqs": [
          {
            "question": "What will be the result of: int('3.14')?",
            "options": [
              "3.14",
              "3",
              "Error",
              "314"
            ],
            "correct": 2,
            "marks": 2,
            "difficulty": "medium",
            "explanation": "int() cannot directly convert a string with decimal point. You'd need float('3.14') first, then int()."
          },
          {
            "question": "Which of the following is a mutable data type in Python?",
            "options": [
              "int",
              "str",
              "list",
              "tuple"
            ],
            "correct": 2,
            "marks": 2,
            "difficulty": "medium",
            "explanation": "Lists are mutable in Python, meaning their contents can be changed after creation."
          }
        ],
        "codeChallenges": [
          {
            "title": "Type Conversion Challenge",
            "description": "Convert between different data types and display results.",
            "sampleInput": "No input required",
            "sampleOutput": "String: 42\nInteger: 42\nFloat: 42.0",
            "constraints": "Use type conversion functions",
            "initialCode": "# Start with a number\nnumber = 42\n\n# Convert and print in different formats\n",
            "language": "python",
            "difficulty": "medium",
            "marks": 6,
            "testCases": [
              {
                "input": "",
                "expectedOutput": "String: 42\nInteger: 42\nFloat: 42.0",
                "isHidden": false
              }
            ]
          },
          {
            "title": "Boolean Logic",
            "description": "Create boolean variables and test logical operations.",
            "sampleInput": "No input required",
            "sampleOutput": "True\nFalse\nTrue",
            "constraints": "Use boolean variables and logical operators",
            "initialCode": "# Create boolean variables\nis_python_fun = True\nis_difficult = False\n\n# Print logical operations\n",
            "language": "python",
            "difficulty": "medium",
            "marks": 6,
            "testCases": [
              {
                "input": "",
                "expectedOutput": "True\nFalse\nTrue",
                "isHidden": false
              }
            ]
          }
        ],
        "totalMarks": 16
      }
    }
  ],
  "finalExam": {
    "title": "Python Programming Final Assessment",
    "description": "Comprehensive final exam covering all Python programming concepts learned in this course. This exam includes both multiple-choice questions and coding challenges to test your understanding.",
    "mcqs": [
      {
        "question": "Which of the following is the correct way to define a function in Python?",
        "options": [
          "function myFunc():",
          "def myFunc():",
          "define myFunc():",
          "func myFunc():"
        ],
        "correct": 1,
        "marks": 5,
        "difficulty": "medium",
        "explanation": "Functions in Python are defined using the 'def' keyword followed by the function name and parentheses."
      },
      {
        "question": "What will be the output of: print(type([1, 2, 3]))?",
        "options": [
          "<class 'tuple'>",
          "<class 'list'>",
          "<class 'dict'>",
          "<class 'set'>"
        ],
        "correct": 1,
        "marks": 5,
        "difficulty": "easy",
        "explanation": "Square brackets [] create a list in Python, so type() returns <class 'list'>."
      },
      {
        "question": "Which operator is used for exponentiation in Python?",
        "options": [
          "^",
          "**",
          "exp()",
          "pow"
        ],
        "correct": 1,
        "marks": 5,
        "difficulty": "medium",
        "explanation": "The ** operator is used for exponentiation in Python (e.g., 2**3 = 8)."
      },
      {
        "question": "What is the correct way to create a comment in Python?",
        "options": [
          "// This is a comment",
          "/* This is a comment */",
          "# This is a comment",
          "<!-- This is a comment -->"
        ],
        "correct": 2,
        "marks": 5,
        "difficulty": "easy",
        "explanation": "Python uses the # symbol for single-line comments."
      },
      {
        "question": "Which of the following will cause an error in Python?",
        "options": [
          "x = 5",
          "2x = 10",
          "_var = 'hello'",
          "my_var = True"
        ],
        "correct": 1,
        "marks": 5,
        "difficulty": "medium",
        "explanation": "Variable names cannot start with a number in Python. '2x' is invalid."
      }
    ],
    "codeChallenges": [
      {
        "title": "Python Calculator",
        "description": "Create a simple calculator that takes two numbers and an operator (+, -, *, /) as input and returns the result.",
        "sampleInput": "10\n5\n+",
        "sampleOutput": "15",
        "constraints": "Handle basic arithmetic operations. Assume valid input.",
        "initialCode": "# Create a simple calculator\n# Read two numbers and an operator\nnum1 = float(input())\nnum2 = float(input())\noperator = input()\n\n# Perform calculation and print result\n",
        "language": "python",
        "difficulty": "medium",
        "marks": 25,
        "testCases": [
          {
            "input": "10\n5\n+",
            "expectedOutput": "15.0",
            "isHidden": false
          },
          {
            "input": "20\n4\n/",
            "expectedOutput": "5.0",
            "isHidden": false
          },
          {
            "input": "7\n3\n*",
            "expectedOutput": "21.0",
            "isHidden": true
          }
        ]
      },
      {
        "title": "String Manipulation",
        "description": "Write a program that takes a string input and performs the following operations: 1) Convert to uppercase, 2) Count vowels, 3) Reverse the string.",
        "sampleInput": "hello",
        "sampleOutput": "HELLO\n2\nolleh",
        "constraints": "Print each result on a new line. Count only a, e, i, o, u as vowels.",
        "initialCode": "# String manipulation program\ntext = input()\n\n# Convert to uppercase\n\n# Count vowels\n\n# Reverse string\n",
        "language": "python",
        "difficulty": "hard",
        "marks": 25,
        "testCases": [
          {
            "input": "hello",
            "expectedOutput": "HELLO\n2\nolleh",
            "isHidden": false
          },
          {
            "input": "python",
            "expectedOutput": "PYTHON\n1\nnohtyp",
            "isHidden": false
          },
          {
            "input": "programming",
            "expectedOutput": "PROGRAMMING\n3\ngnimmargorP",
            "isHidden": true
          }
        ]
      }
    ],
    "totalMarks": 75,
    "duration": 90,
    "passingScore": 60,
    "isActive": true
  }
};

async function seedPythonCourse() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing Python course if any
    const deleteResult = await Course.deleteMany({ 
      title: "Python Programming Fundamentals" 
    });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing Python courses`);

    // Create new Python course
    const pythonCourse = new Course(pythonCourseData);
    const savedCourse = await pythonCourse.save();
    
    console.log('🎉 Python Programming Fundamentals course created successfully!');
    console.log(`📚 Course ID: ${savedCourse._id}`);
    console.log(`📖 Topics: ${savedCourse.topics.length}`);
    
    // Log topic and lesson details
    savedCourse.topics.forEach((topic, index) => {
      console.log(`   ${index + 1}. ${topic.title} (${topic.lessons.length} lessons)`);
      topic.lessons.forEach((lesson, lessonIndex) => {
        console.log(`      ${lessonIndex + 1}. ${lesson.title} (${lesson.type})`);
      });
    });

    console.log('\n🔗 Sample URLs for testing:');
    if (savedCourse.topics.length > 0) {
      const firstTopic = savedCourse.topics[0];
      if (firstTopic.lessons.length > 0) {
        const firstLesson = firstTopic.lessons[0];
        console.log(`   Course: /courses/${savedCourse._id}`);
        console.log(`   First Lesson: /courses/${savedCourse._id}/topics/${firstTopic._id}/lessons/${firstLesson._id}`);
      }
    }

  } catch (error) {
    console.error('❌ Error seeding Python course:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedPythonCourse();
