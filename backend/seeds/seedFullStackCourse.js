const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

// MongoDB connection using environment variable
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mlrit-code-hub';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
    console.log(`Connected to: ${mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Full Stack Web Development Course Data (Unified Schema)
const fullStackCourseData = {
  title: "Full Stack Web Development",
  description: "A beginner-to-advanced course covering front-end, back-end, and deployment.",
  difficulty: "Medium",
  duration: "12 weeks",
  instructor: "Tech Academy",
  tags: ["web development", "javascript", "html", "css", "nodejs", "full stack"],
  isActive: true,
  enrolledCount: 0,
  enrolledUsers: [],
  testUnlockThreshold: 80,
  topics: [
    {
      title: "HTML & CSS Basics",
      description: "Learn the building blocks of web pages.",
      order: 1,
      lessons: [
        {
          title: "Introduction to HTML",
          type: "lesson",
          order: 1,
          duration: "45m",
          content: `
            <h2>What is HTML?</h2>
            <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a webpage using elements and tags.</p>
            
            <h3>Basic HTML Structure</h3>
            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Page Title&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Main Heading&lt;/h1&gt;
    &lt;p&gt;This is a paragraph.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

            <h3>Common HTML Elements</h3>
            <ul>
              <li><strong>Headings:</strong> &lt;h1&gt; to &lt;h6&gt;</li>
              <li><strong>Paragraphs:</strong> &lt;p&gt;</li>
              <li><strong>Links:</strong> &lt;a href="url"&gt;</li>
              <li><strong>Images:</strong> &lt;img src="url" alt="description"&gt;</li>
              <li><strong>Lists:</strong> &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</li>
            </ul>
          `,
          mcqs: [
            {
              question: "What does HTML stand for?",
              options: ["HyperText Makeup Language", "HyperText Markup Language", "Home Tool Markup Language"],
              correct: 1,
              explanation: "HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages."
            },
            {
              question: "Which tag is used for the largest heading?",
              options: ["<heading>", "<h6>", "<h1>"],
              correct: 2,
              explanation: "<h1> is used for the largest heading in HTML. Headings go from <h1> (largest) to <h6> (smallest)."
            }
          ],
          codeChallenges: [
            {
              title: "Create a Basic HTML Page",
              description: "Write an HTML page with a heading, paragraph, and a link.",
              sampleInput: "",
              sampleOutput: "<h1>Hello</h1><p>Welcome</p><a href='https://example.com'>Click</a>",
              constraints: "Must use valid HTML5 syntax",
              initialCode: `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
</head>
<body>
  <!-- Add your HTML elements here -->
  
</body>
</html>`,
              language: "html",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Should contain h1, p, and a tags",
                  description: "Check for proper HTML structure"
                }
              ]
            },
            {
              title: "HTML Lists",
              description: "Create an ordered list with three items.",
              sampleInput: "",
              sampleOutput: "<ol><li>One</li><li>Two</li><li>Three</li></ol>",
              constraints: "Must use <ol> and <li> tags",
              initialCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Create your ordered list here -->
  
</body>
</html>`,
              language: "html",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Should contain ol with three li elements",
                  description: "Verify ordered list structure"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>The basic structure of HTML documents</li>
              <li>Common HTML elements and their purposes</li>
              <li>How to create headings, paragraphs, and links</li>
              <li>The importance of semantic HTML markup</li>
            </ul>
            <p><strong>Next:</strong> You'll learn how to style these HTML elements with CSS!</p>
          `
        },
        {
          title: "CSS Fundamentals",
          type: "lesson",
          order: 2,
          duration: "50m",
          content: `
            <h2>What is CSS?</h2>
            <p>CSS (Cascading Style Sheets) is used to style and layout web pages. It controls the presentation of HTML elements.</p>
            
            <h3>CSS Syntax</h3>
            <pre><code>selector {
  property: value;
  property: value;
}</code></pre>

            <h3>Ways to Add CSS</h3>
            <ol>
              <li><strong>Inline:</strong> style="color: red;"</li>
              <li><strong>Internal:</strong> &lt;style&gt; in &lt;head&gt;</li>
              <li><strong>External:</strong> &lt;link&gt; to .css file</li>
            </ol>

            <h3>Common CSS Properties</h3>
            <ul>
              <li><strong>color:</strong> Text color</li>
              <li><strong>background-color:</strong> Background color</li>
              <li><strong>font-size:</strong> Text size</li>
              <li><strong>font-weight:</strong> Text boldness</li>
              <li><strong>margin:</strong> Space outside element</li>
              <li><strong>padding:</strong> Space inside element</li>
            </ul>
          `,
          mcqs: [
            {
              question: "Which property changes text color in CSS?",
              options: ["font-color", "color", "text-color"],
              correct: 1,
              explanation: "The 'color' property changes text color in CSS. It's one of the most basic CSS properties."
            },
            {
              question: "Which CSS property controls the size of text?",
              options: ["font-style", "font-size", "text-size"],
              correct: 1,
              explanation: "'font-size' sets the size of text. You can use values like pixels (px), em, rem, or percentages."
            }
          ],
          codeChallenges: [
            {
              title: "Change Background Color",
              description: "Set the background color of a div to blue.",
              sampleInput: "",
              sampleOutput: "<div style='background-color:blue;'></div>",
              constraints: "Use CSS background-color property",
              initialCode: `<div>This is a div</div>

<style>
/* Add your CSS here */

</style>`,
              language: "css",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Div should have blue background",
                  description: "Check background-color property"
                }
              ]
            },
            {
              title: "Text Styling",
              description: "Change paragraph text to red and bold.",
              sampleInput: "",
              sampleOutput: "<p style='color:red;font-weight:bold;'>Text</p>",
              constraints: "Use CSS color and font-weight properties",
              initialCode: `<p>This is some text</p>

<style>
/* Add your CSS here */

</style>`,
              language: "css",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Text should be red and bold",
                  description: "Check color and font-weight properties"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>The purpose and syntax of CSS</li>
              <li>Different ways to include CSS in your HTML</li>
              <li>Common CSS properties for styling text and backgrounds</li>
              <li>How to apply styles to HTML elements</li>
            </ul>
            <p><strong>Next:</strong> You'll dive into JavaScript to add interactivity!</p>
          `
        }
      ]
    },
    {
      title: "JavaScript Essentials",
      description: "Learn JavaScript fundamentals for web interactivity.",
      order: 2,
      lessons: [
        {
          title: "Variables and Data Types",
          type: "lesson",
          order: 1,
          duration: "40m",
          content: `
            <h2>JavaScript Variables</h2>
            <p>JavaScript variables store data values. They are containers for storing information that can be used and manipulated throughout your program.</p>
            
            <h3>Variable Declaration</h3>
            <pre><code>// ES6+ (recommended)
let name = "John";
const age = 25;

// Older syntax
var city = "New York";</code></pre>

            <h3>Data Types</h3>
            <ul>
              <li><strong>String:</strong> "Hello World", 'JavaScript'</li>
              <li><strong>Number:</strong> 42, 3.14, -10</li>
              <li><strong>Boolean:</strong> true, false</li>
              <li><strong>Array:</strong> [1, 2, 3], ["a", "b", "c"]</li>
              <li><strong>Object:</strong> {name: "John", age: 25}</li>
              <li><strong>Undefined:</strong> Variable declared but not assigned</li>
              <li><strong>Null:</strong> Intentionally empty value</li>
            </ul>

            <h3>Variable Scope</h3>
            <ul>
              <li><strong>let:</strong> Block-scoped, can be reassigned</li>
              <li><strong>const:</strong> Block-scoped, cannot be reassigned</li>
              <li><strong>var:</strong> Function-scoped (avoid in modern JS)</li>
            </ul>
          `,
          mcqs: [
            {
              question: "Which keyword declares a block-scoped variable that can be reassigned?",
              options: ["var", "let", "const"],
              correct: 1,
              explanation: "'let' declares a block-scoped variable that can be reassigned. 'const' cannot be reassigned, and 'var' is function-scoped."
            },
            {
              question: "What is the data type of '42' (with quotes)?",
              options: ["number", "string", "boolean"],
              correct: 1,
              explanation: "'42' with quotes is a string. Without quotes, 42 would be a number."
            }
          ],
          codeChallenges: [
            {
              title: "Declare a Variable",
              description: "Declare a variable named x with value 10 and log it to console.",
              sampleInput: "",
              sampleOutput: "10",
              constraints: "Use let or const keyword",
              initialCode: `// Declare your variable here


// Log the variable to console
console.log(x);`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "10",
                  description: "Variable x should equal 10"
                }
              ]
            },
            {
              title: "String Concatenation",
              description: "Concatenate two strings 'Hello' and 'World' and store in a variable.",
              sampleInput: "",
              sampleOutput: "HelloWorld",
              constraints: "Use + operator for concatenation",
              initialCode: `// Create two string variables
let str1 = "Hello";
let str2 = "World";

// Concatenate them


console.log(result);`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "HelloWorld",
                  description: "Should concatenate strings without space"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>How to declare variables using let, const, and var</li>
              <li>Different JavaScript data types and their uses</li>
              <li>The concept of variable scope and when to use each keyword</li>
              <li>Basic string operations and concatenation</li>
            </ul>
            <p><strong>Next:</strong> You'll learn about functions and control structures in JavaScript!</p>
          `
        }
      ]
    },
    {
      title: "Node.js & Backend",
      description: "Learn to build server-side applications with Node.js and Express.",
      order: 3,
      lessons: [
        {
          title: "Intro to Node.js",
          type: "lesson",
          order: 1,
          duration: "60m",
          content: `
            <h2>What is Node.js?</h2>
            <p>Node.js is a runtime environment that allows JavaScript to run on the server side. It's built on Chrome's V8 JavaScript engine and enables full-stack JavaScript development.</p>
            
            <h3>Key Features</h3>
            <ul>
              <li><strong>Asynchronous & Non-blocking:</strong> Handles multiple requests efficiently</li>
              <li><strong>NPM:</strong> Vast package ecosystem</li>
              <li><strong>Cross-platform:</strong> Runs on Windows, macOS, Linux</li>
              <li><strong>Fast:</strong> Built on V8 engine</li>
            </ul>

            <h3>Core Modules</h3>
            <pre><code>// HTTP module for creating servers
const http = require('http');

// File System module for file operations
const fs = require('fs');

// Path module for working with file paths
const path = require('path');</code></pre>

            <h3>Creating a Simple Server</h3>
            <pre><code>const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});</code></pre>

            <h3>Package Management</h3>
            <ul>
              <li><strong>npm init:</strong> Initialize a new project</li>
              <li><strong>npm install:</strong> Install packages</li>
              <li><strong>package.json:</strong> Project configuration</li>
            </ul>
          `,
          mcqs: [
            {
              question: "Which command initializes a new Node.js project?",
              options: ["node init", "npm init", "init node"],
              correct: 1,
              explanation: "'npm init' initializes a new Node.js project and creates a package.json file with project metadata."
            },
            {
              question: "Which built-in module is used for creating an HTTP server?",
              options: ["http", "server", "fs"],
              correct: 0,
              explanation: "The 'http' module is Node.js's built-in module for creating HTTP servers and handling HTTP requests/responses."
            }
          ],
          codeChallenges: [
            {
              title: "Hello World Server",
              description: "Create an HTTP server that responds with 'Hello World' on port 3000.",
              sampleInput: "",
              sampleOutput: "Hello World",
              constraints: "Use the http module and listen on port 3000",
              initialCode: `const http = require('http');

// Create your server here


// Make the server listen on port 3000
`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "Hello World",
                  description: "Server should respond with 'Hello World'"
                }
              ]
            },
            {
              title: "Read File",
              description: "Use the fs module to read a file called 'data.txt' and log its content.",
              sampleInput: "",
              sampleOutput: "File content here",
              constraints: "Use fs.readFile() method",
              initialCode: `const fs = require('fs');

// Read the file 'data.txt' and log its content

`,
              language: "javascript",
              testCases: [
                { 
                  input: "", 
                  expectedOutput: "File content should be logged",
                  description: "Should read and display file content"
                }
              ]
            }
          ],
          review: `
            <h3>What You Learned</h3>
            <p>In this lesson, you learned:</p>
            <ul>
              <li>What Node.js is and its key features</li>
              <li>Core Node.js modules like http and fs</li>
              <li>How to create a basic HTTP server</li>
              <li>Package management with npm</li>
              <li>File operations using the fs module</li>
            </ul>
            <p><strong>Next:</strong> You'll learn about Express.js framework and building REST APIs!</p>
          `
        }
      ]
    }
  ]
};

// Function to seed the Full Stack Web Development course
const seedFullStackCourse = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if course already exists
    const existingCourse = await Course.findOne({ title: fullStackCourseData.title });
    
    if (existingCourse) {
      console.log('Full Stack Web Development course already exists. Updating...');
      
      // Update existing course
      const updatedCourse = await Course.findByIdAndUpdate(
        existingCourse._id,
        fullStackCourseData,
        { new: true, runValidators: true }
      );
      
      console.log('✅ Full Stack Web Development course updated successfully!');
      console.log(`Course ID: ${updatedCourse._id}`);
      console.log(`Topics: ${updatedCourse.topics.length}`);
      console.log(`Total Lessons: ${updatedCourse.topics.reduce((acc, topic) => acc + topic.lessons.length, 0)}`);
      
    } else {
      // Create new course
      const newCourse = new Course(fullStackCourseData);
      const savedCourse = await newCourse.save();
      
      console.log('✅ Full Stack Web Development course created successfully!');
      console.log(`Course ID: ${savedCourse._id}`);
      console.log(`Topics: ${savedCourse.topics.length}`);
      console.log(`Total Lessons: ${savedCourse.topics.reduce((acc, topic) => acc + topic.lessons.length, 0)}`);
    }

    // Verify the course structure
    const course = await Course.findOne({ title: fullStackCourseData.title });
    console.log('\n📊 Course Structure Verification:');
    
    course.topics.forEach((topic, topicIndex) => {
      console.log(`\nTopic ${topicIndex + 1}: ${topic.title}`);
      topic.lessons.forEach((lesson, lessonIndex) => {
        console.log(`  Lesson ${lessonIndex + 1}: ${lesson.title}`);
        console.log(`    - Content: ${lesson.content ? '✅' : '❌'}`);
        console.log(`    - MCQs: ${lesson.mcqs?.length === 2 ? '✅ (2)' : `❌ (${lesson.mcqs?.length || 0})`}`);
        console.log(`    - Coding Challenges: ${lesson.codeChallenges?.length === 2 ? '✅ (2)' : `❌ (${lesson.codeChallenges?.length || 0})`}`);
        console.log(`    - Review: ${lesson.review ? '✅' : '❌'}`);
      });
    });

    console.log('\n🎉 Full Stack Web Development course is ready for students!');
    
  } catch (error) {
    console.error('❌ Error seeding Full Stack Web Development course:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the seeding function
if (require.main === module) {
  seedFullStackCourse();
}

module.exports = { seedFullStackCourse, fullStackCourseData };
