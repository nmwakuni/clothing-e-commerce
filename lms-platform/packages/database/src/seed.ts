import { db } from './index';
import { users, courses, lessons } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create sample users
    console.log('Creating users...');
    const [adminUser] = await db
      .insert(users)
      .values([
        {
          phoneNumber: '+254712345678',
          email: 'admin@skillhub.co.ke',
          fullName: 'Admin User',
          role: 'admin',
          subscriptionTier: 'premium_plus',
        },
        {
          phoneNumber: '+254722222222',
          email: 'creator@skillhub.co.ke',
          fullName: 'Jane Creator',
          role: 'creator',
          subscriptionTier: 'premium',
        },
        {
          phoneNumber: '+254733333333',
          email: 'student@skillhub.co.ke',
          fullName: 'John Student',
          role: 'student',
          subscriptionTier: 'free',
        },
      ])
      .returning();

    console.log('✅ Users created');

    // Create sample courses
    console.log('Creating courses...');
    const coursesData = await db
      .insert(courses)
      .values([
        {
          title: 'Web Development Fundamentals',
          slug: 'web-development-fundamentals',
          description:
            'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Build real projects and deploy them live. Perfect for beginners looking to start a career in tech.',
          shortDescription: 'Master HTML, CSS & JavaScript from scratch',
          thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
          difficulty: 'beginner',
          category: 'web-development',
          tags: ['html', 'css', 'javascript', 'web'],
          priceKes: 2500,
          originalPriceKes: 5000,
          estimatedHours: '18',
          totalLessons: 42,
          enrollmentCount: 3421,
          averageRating: '4.8',
          learningOutcomes: [
            'Build responsive websites with HTML & CSS',
            'Create interactive web pages with JavaScript',
            'Deploy websites to the internet',
            'Understand how the web works',
            'Build a professional portfolio',
          ],
          prerequisites: ['Basic computer skills', 'Willingness to learn'],
          status: 'published',
          publishedAt: new Date(),
          language: 'English',
          aiContext: 'This course teaches web development fundamentals for absolute beginners with African context.',
        },
        {
          title: 'Python for Data Science',
          slug: 'python-data-science',
          description:
            'Learn Python programming and data analysis from scratch. Master pandas, numpy, and data visualization. Build real data science projects that matter.',
          shortDescription: 'Learn Python and data analysis from scratch',
          thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
          difficulty: 'beginner',
          category: 'data-science',
          tags: ['python', 'data-science', 'pandas', 'numpy'],
          priceKes: 3000,
          originalPriceKes: 6000,
          estimatedHours: '22',
          totalLessons: 38,
          enrollmentCount: 1823,
          averageRating: '4.7',
          learningOutcomes: [
            'Master Python programming basics',
            'Analyze data with pandas and numpy',
            'Create data visualizations',
            'Build data science projects',
          ],
          prerequisites: ['Basic math skills', 'A computer'],
          status: 'published',
          publishedAt: new Date(),
          language: 'English',
          aiContext: 'This course teaches Python for data science with African context examples.',
        },
        {
          title: 'Mobile App Development with React Native',
          slug: 'react-native-mobile-development',
          description:
            'Build iOS and Android apps using React Native. Learn mobile development from scratch and publish your own apps to the App Store and Play Store.',
          shortDescription: 'Build cross-platform mobile apps',
          thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
          difficulty: 'intermediate',
          category: 'mobile-development',
          tags: ['react-native', 'mobile', 'ios', 'android'],
          priceKes: 4000,
          originalPriceKes: 8000,
          estimatedHours: '28',
          totalLessons: 52,
          enrollmentCount: 956,
          averageRating: '4.9',
          learningOutcomes: [
            'Build native mobile apps',
            'Master React Native',
            'Integrate APIs and databases',
            'Publish to App Store and Play Store',
          ],
          prerequisites: ['JavaScript basics', 'React basics'],
          status: 'published',
          publishedAt: new Date(),
          language: 'English',
          aiContext: 'This course teaches mobile app development with React Native.',
        },
      ])
      .returning();

    const [webDevCourse, pythonCourse, mobileCourse] = coursesData;

    console.log('✅ Created 3 courses');

    // Create comprehensive lessons
    console.log('Creating lessons...');

    // Web Development Course - Complete curriculum
    await db.insert(lessons).values([
      // Section 1: HTML Fundamentals
      {
        courseId: webDevCourse.id,
        title: 'Introduction to HTML',
        slug: 'introduction-to-html',
        description: 'Learn the basics of HTML and create your first web page',
        contentType: 'text',
        contentData: {
          markdown: `# Welcome to Web Development!

In this lesson, you'll learn:
- What is HTML?
- Basic HTML structure
- Common HTML tags
- Your first webpage

## What is HTML?
HTML (HyperText Markup Language) is the standard language for creating web pages. It's the foundation of all websites you see on the internet.

## Basic HTML Structure
Every HTML page follows this basic structure:
\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Page Title</title>
  </head>
  <body>
    <!-- Your content goes here -->
  </body>
</html>
\`\`\`

## Common HTML Tags
- \`<h1>\` to \`<h6>\` - Headings
- \`<p>\` - Paragraphs
- \`<a>\` - Links
- \`<img>\` - Images
- \`<div>\` - Container

Let's build your first webpage in the next lesson!`,
          readingTime: 15,
        },
        sectionName: 'HTML Fundamentals',
        orderIndex: 1,
        estimatedMinutes: 30,
        isPreview: true,
        isPublished: true,
        aiContext: 'This lesson introduces HTML basics. Help students understand tags, elements, and basic page structure.',
      },
      {
        courseId: webDevCourse.id,
        title: 'HTML Tags and Elements',
        slug: 'html-tags-and-elements',
        description: 'Deep dive into HTML tags and how to structure content',
        contentType: 'interactive',
        contentData: {
          exerciseType: 'code',
          codeTemplate: `<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <!-- Add your HTML here -->
    <!-- Task: Create a heading and a paragraph -->

</body>
</html>`,
          tests: [
            {
              description: 'Page should have an h1 tag',
              test: 'document.querySelector("h1")',
            },
            {
              description: 'Page should have a paragraph',
              test: 'document.querySelector("p")',
            },
          ],
        },
        sectionName: 'HTML Fundamentals',
        orderIndex: 2,
        estimatedMinutes: 45,
        isPreview: true,
        isPublished: true,
        aiContext: 'Students practice writing HTML tags. Help them understand proper nesting and common tags like h1, p, div, etc.',
      },
      {
        courseId: webDevCourse.id,
        title: 'Lists, Links, and Images',
        slug: 'lists-links-images',
        description: 'Learn how to add lists, links, and images to your webpage',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/html-lists-links.mp4',
          duration: 900,
          subtitles: 'https://example.com/videos/html-lists-links.vtt',
        },
        sectionName: 'HTML Fundamentals',
        orderIndex: 3,
        estimatedMinutes: 35,
        isPublished: true,
        aiContext: 'Teaching HTML lists (ul, ol), links (a), and images (img).',
      },
      {
        courseId: webDevCourse.id,
        title: 'HTML Forms and Input',
        slug: 'html-forms',
        description: 'Build interactive forms to collect user input',
        contentType: 'interactive',
        contentData: {
          exerciseType: 'code',
          codeTemplate: `<!DOCTYPE html>
<html>
<body>
    <form>
        <!-- Create a form with name and email inputs -->

    </form>
</body>
</html>`,
          tests: [
            {
              description: 'Form should have a name input',
              test: 'document.querySelector(\'input[name="name"]\')',
            },
            {
              description: 'Form should have an email input',
              test: 'document.querySelector(\'input[type="email"]\')',
            },
          ],
        },
        sectionName: 'HTML Fundamentals',
        orderIndex: 4,
        estimatedMinutes: 50,
        isPublished: true,
        aiContext: 'Teaching HTML forms, input fields, and form submission.',
      },
      {
        courseId: webDevCourse.id,
        title: 'HTML Quiz',
        slug: 'html-quiz',
        description: 'Test your HTML knowledge',
        contentType: 'quiz',
        contentData: {
          questions: [
            {
              question: 'What does HTML stand for?',
              options: [
                'Hyper Text Markup Language',
                'High Tech Modern Language',
                'Home Tool Markup Language',
                'Hyperlinks and Text Markup Language',
              ],
              correctAnswer: 0,
            },
            {
              question: 'Which tag is used for the largest heading?',
              options: ['<head>', '<h6>', '<heading>', '<h1>'],
              correctAnswer: 3,
            },
          ],
        },
        sectionName: 'HTML Fundamentals',
        orderIndex: 5,
        estimatedMinutes: 20,
        isPublished: true,
        aiContext: 'HTML knowledge assessment quiz.',
      },

      // Section 2: CSS Styling
      {
        courseId: webDevCourse.id,
        title: 'Introduction to CSS',
        slug: 'introduction-to-css',
        description: 'Learn how to style your web pages with CSS',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/css-intro.mp4',
          duration: 1200,
          subtitles: 'https://example.com/videos/css-intro.vtt',
        },
        sectionName: 'CSS Styling',
        orderIndex: 6,
        estimatedMinutes: 40,
        isPublished: true,
        aiContext: 'Introduction to CSS selectors, properties, and values.',
      },
      {
        courseId: webDevCourse.id,
        title: 'CSS Selectors and Properties',
        slug: 'css-selectors',
        description: 'Master CSS selectors and common properties',
        contentType: 'text',
        contentData: {
          markdown: `# CSS Selectors and Properties

## CSS Selectors
CSS selectors target HTML elements to style them:

### Element Selector
\`\`\`css
p {
  color: blue;
}
\`\`\`

### Class Selector
\`\`\`css
.highlight {
  background-color: yellow;
}
\`\`\`

### ID Selector
\`\`\`css
#header {
  font-size: 24px;
}
\`\`\`

## Common CSS Properties
- \`color\` - Text color
- \`background-color\` - Background color
- \`font-size\` - Text size
- \`margin\` - Space outside element
- \`padding\` - Space inside element
- \`border\` - Element border

Practice these in the next exercise!`,
          readingTime: 12,
        },
        sectionName: 'CSS Styling',
        orderIndex: 7,
        estimatedMinutes: 35,
        isPublished: true,
        aiContext: 'Teaching CSS selectors (element, class, id) and common properties.',
      },
      {
        courseId: webDevCourse.id,
        title: 'CSS Box Model',
        slug: 'css-box-model',
        description: 'Understand the CSS box model and layout',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/css-box-model.mp4',
          duration: 1080,
        },
        sectionName: 'CSS Styling',
        orderIndex: 8,
        estimatedMinutes: 45,
        isPublished: true,
        aiContext: 'Teaching CSS box model: margin, border, padding, content.',
      },
      {
        courseId: webDevCourse.id,
        title: 'Flexbox Layout',
        slug: 'css-flexbox',
        description: 'Build flexible responsive layouts with Flexbox',
        contentType: 'interactive',
        contentData: {
          exerciseType: 'code',
          codeTemplate: `<!DOCTYPE html>
<html>
<head>
<style>
.container {
  display: flex;
  /* Add flexbox properties here */
}

.box {
  width: 100px;
  height: 100px;
  background: green;
  margin: 10px;
}
</style>
</head>
<body>
  <div class="container">
    <div class="box">1</div>
    <div class="box">2</div>
    <div class="box">3</div>
  </div>
</body>
</html>`,
          tests: [
            {
              description: 'Container should use flexbox',
              test: 'getComputedStyle(document.querySelector(".container")).display === "flex"',
            },
          ],
        },
        sectionName: 'CSS Styling',
        orderIndex: 9,
        estimatedMinutes: 60,
        isPublished: true,
        aiContext: 'Teaching CSS Flexbox: flex-direction, justify-content, align-items.',
      },
      {
        courseId: webDevCourse.id,
        title: 'Responsive Design with Media Queries',
        slug: 'responsive-design',
        description: 'Make your websites look great on all devices',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/responsive-design.mp4',
          duration: 1500,
        },
        sectionName: 'CSS Styling',
        orderIndex: 10,
        estimatedMinutes: 50,
        isPublished: true,
        aiContext: 'Teaching responsive design with media queries and mobile-first approach.',
      },

      // Section 3: JavaScript Basics
      {
        courseId: webDevCourse.id,
        title: 'Introduction to JavaScript',
        slug: 'introduction-to-javascript',
        description: 'Start your journey with JavaScript programming',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/javascript-intro.mp4',
          duration: 1400,
        },
        sectionName: 'JavaScript Basics',
        orderIndex: 11,
        estimatedMinutes: 45,
        isPublished: true,
        aiContext: 'Introduction to JavaScript: what it is, where it runs, basic syntax.',
      },
      {
        courseId: webDevCourse.id,
        title: 'Variables and Data Types',
        slug: 'javascript-variables',
        description: 'Learn about JavaScript variables, strings, numbers, and more',
        contentType: 'text',
        contentData: {
          markdown: `# JavaScript Variables and Data Types

## Variables
Variables store data values:

\`\`\`javascript
let name = "John";
const age = 25;
var city = "Nairobi";
\`\`\`

## Data Types

### String
\`\`\`javascript
let greeting = "Hello, World!";
\`\`\`

### Number
\`\`\`javascript
let count = 42;
let price = 19.99;
\`\`\`

### Boolean
\`\`\`javascript
let isActive = true;
let hasAccess = false;
\`\`\`

### Array
\`\`\`javascript
let fruits = ["apple", "banana", "orange"];
\`\`\`

### Object
\`\`\`javascript
let person = {
  name: "Mary",
  age: 30,
  city: "Nairobi"
};
\`\`\`

Practice these concepts in the next exercise!`,
          readingTime: 18,
        },
        sectionName: 'JavaScript Basics',
        orderIndex: 12,
        estimatedMinutes: 40,
        isPublished: true,
        aiContext: 'Teaching JavaScript variables (let, const, var) and data types.',
      },
      {
        courseId: webDevCourse.id,
        title: 'Functions in JavaScript',
        slug: 'javascript-functions',
        description: 'Write reusable code with functions',
        contentType: 'interactive',
        contentData: {
          exerciseType: 'code',
          codeTemplate: `// Create a function that adds two numbers
function add(a, b) {
  // Write your code here

}

// Test your function
console.log(add(5, 3)); // Should output 8`,
          tests: [
            {
              description: 'add function should return sum of two numbers',
              test: 'add(5, 3) === 8',
            },
          ],
        },
        sectionName: 'JavaScript Basics',
        orderIndex: 13,
        estimatedMinutes: 55,
        isPublished: true,
        aiContext: 'Teaching JavaScript functions: declaration, parameters, return values.',
      },
      {
        courseId: webDevCourse.id,
        title: 'DOM Manipulation',
        slug: 'dom-manipulation',
        description: 'Learn to interact with web pages using JavaScript',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/dom-manipulation.mp4',
          duration: 1600,
        },
        sectionName: 'JavaScript Basics',
        orderIndex: 14,
        estimatedMinutes: 50,
        isPublished: true,
        aiContext: 'Teaching DOM manipulation: querySelector, getElementById, innerHTML, addEventListener.',
      },
      {
        courseId: webDevCourse.id,
        title: 'Build a Todo List App',
        slug: 'build-todo-app',
        description: 'Apply your knowledge to build an interactive todo list',
        contentType: 'project',
        contentData: {
          projectType: 'web-app',
          starterCode: `<!DOCTYPE html>
<html>
<head>
  <title>My Todo List</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <h1>My Todo List</h1>
  <input type="text" id="todoInput" placeholder="Add a task...">
  <button id="addBtn">Add</button>
  <ul id="todoList"></ul>

  <script>
    // Add your JavaScript here
  </script>
</body>
</html>`,
          requirements: [
            'Add new todos',
            'Mark todos as complete',
            'Delete todos',
            'Save todos to localStorage',
          ],
        },
        sectionName: 'JavaScript Basics',
        orderIndex: 15,
        estimatedMinutes: 120,
        isPublished: true,
        aiContext: 'Project: Building an interactive todo list application with JavaScript.',
      },
    ]);

    console.log('✅ Web Development lessons created (15 lessons)');

    // Python for Data Science Course - Complete curriculum
    await db.insert(lessons).values([
      // Section 1: Python Basics
      {
        courseId: pythonCourse.id,
        title: 'Introduction to Python',
        slug: 'introduction-to-python',
        description: 'Get started with Python programming',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/python-intro.mp4',
          duration: 1200,
        },
        sectionName: 'Python Basics',
        orderIndex: 1,
        estimatedMinutes: 30,
        isPreview: true,
        isPublished: true,
        aiContext: 'Introduction to Python basics, installation, first program.',
      },
      {
        courseId: pythonCourse.id,
        title: 'Variables and Data Types',
        slug: 'variables-data-types',
        description: 'Learn about Python variables, strings, numbers, and more',
        contentType: 'text',
        contentData: {
          markdown: `# Variables in Python

## What are Variables?
Variables are containers for storing data values. In Python, you don't need to declare variable types.

\`\`\`python
name = "John"
age = 25
height = 5.9
is_student = True
\`\`\`

## Data Types

### Strings
\`\`\`python
greeting = "Hello, World!"
city = 'Nairobi'
\`\`\`

### Numbers
\`\`\`python
# Integer
count = 42

# Float
price = 19.99
\`\`\`

### Booleans
\`\`\`python
is_active = True
has_access = False
\`\`\`

### Lists
\`\`\`python
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]
\`\`\`

### Dictionaries
\`\`\`python
person = {
    "name": "Mary",
    "age": 30,
    "city": "Nairobi"
}
\`\`\`

Try these out in the next exercise!`,
          readingTime: 15,
        },
        sectionName: 'Python Basics',
        orderIndex: 2,
        estimatedMinutes: 35,
        isPreview: true,
        isPublished: true,
        aiContext: 'Python variables, strings, numbers, booleans, lists, dictionaries.',
      },
      {
        courseId: pythonCourse.id,
        title: 'Control Flow - If Statements',
        slug: 'python-if-statements',
        description: 'Learn to make decisions in your code with if statements',
        contentType: 'interactive',
        contentData: {
          exerciseType: 'code',
          codeTemplate: `# Create a program that checks if a number is positive, negative, or zero
number = 10

# Write your if/elif/else statements here

`,
          tests: [
            {
              description: 'Should handle positive numbers',
              test: 'number > 0',
            },
          ],
        },
        sectionName: 'Python Basics',
        orderIndex: 3,
        estimatedMinutes: 40,
        isPublished: true,
        aiContext: 'Teaching Python if/elif/else statements and comparison operators.',
      },
      {
        courseId: pythonCourse.id,
        title: 'Loops in Python',
        slug: 'python-loops',
        description: 'Master for and while loops',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/python-loops.mp4',
          duration: 1350,
        },
        sectionName: 'Python Basics',
        orderIndex: 4,
        estimatedMinutes: 45,
        isPublished: true,
        aiContext: 'Teaching Python for loops, while loops, range(), break, continue.',
      },
      {
        courseId: pythonCourse.id,
        title: 'Functions in Python',
        slug: 'python-functions',
        description: 'Write reusable code with functions',
        contentType: 'text',
        contentData: {
          markdown: `# Functions in Python

## Defining Functions
Functions are reusable blocks of code:

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")

greet("Mary")  # Output: Hello, Mary!
\`\`\`

## Return Values
\`\`\`python
def add(a, b):
    return a + b

result = add(5, 3)  # result = 8
\`\`\`

## Default Parameters
\`\`\`python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("John")  # Output: Hello, John!
greet("Mary", "Hi")  # Output: Hi, Mary!
\`\`\`

Practice writing your own functions!`,
          readingTime: 12,
        },
        sectionName: 'Python Basics',
        orderIndex: 5,
        estimatedMinutes: 40,
        isPublished: true,
        aiContext: 'Teaching Python function definition, parameters, return values.',
      },

      // Section 2: Data Analysis with Pandas
      {
        courseId: pythonCourse.id,
        title: 'Introduction to Pandas',
        slug: 'intro-to-pandas',
        description: 'Get started with data analysis using Pandas',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/pandas-intro.mp4',
          duration: 1500,
        },
        sectionName: 'Data Analysis with Pandas',
        orderIndex: 6,
        estimatedMinutes: 50,
        isPublished: true,
        aiContext: 'Introduction to Pandas library: DataFrames, Series, reading CSV files.',
      },
      {
        courseId: pythonCourse.id,
        title: 'Working with DataFrames',
        slug: 'pandas-dataframes',
        description: 'Master Pandas DataFrames for data manipulation',
        contentType: 'interactive',
        contentData: {
          exerciseType: 'code',
          codeTemplate: `import pandas as pd

# Create a DataFrame
data = {
    'name': ['John', 'Mary', 'Peter', 'Sarah'],
    'age': [25, 30, 35, 28],
    'city': ['Nairobi', 'Mombasa', 'Kisumu', 'Nairobi']
}

df = pd.DataFrame(data)

# Filter for people in Nairobi
# Write your code here

`,
          tests: [
            {
              description: 'Should filter DataFrame correctly',
              test: 'len(df) > 0',
            },
          ],
        },
        sectionName: 'Data Analysis with Pandas',
        orderIndex: 7,
        estimatedMinutes: 60,
        isPublished: true,
        aiContext: 'Teaching Pandas DataFrame operations: filtering, selecting, sorting.',
      },
      {
        courseId: pythonCourse.id,
        title: 'Data Cleaning and Preprocessing',
        slug: 'data-cleaning',
        description: 'Learn to clean and prepare data for analysis',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/data-cleaning.mp4',
          duration: 1800,
        },
        sectionName: 'Data Analysis with Pandas',
        orderIndex: 8,
        estimatedMinutes: 55,
        isPublished: true,
        aiContext: 'Teaching data cleaning: handling missing values, duplicates, data types.',
      },

      // Section 3: Data Visualization
      {
        courseId: pythonCourse.id,
        title: 'Introduction to Matplotlib',
        slug: 'intro-matplotlib',
        description: 'Create visualizations with Matplotlib',
        contentType: 'text',
        contentData: {
          markdown: `# Data Visualization with Matplotlib

## Basic Plot
\`\`\`python
import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]

plt.plot(x, y)
plt.xlabel('X axis')
plt.ylabel('Y axis')
plt.title('My First Plot')
plt.show()
\`\`\`

## Bar Chart
\`\`\`python
categories = ['A', 'B', 'C', 'D']
values = [25, 40, 30, 55]

plt.bar(categories, values)
plt.title('Bar Chart')
plt.show()
\`\`\`

Visualizations help you understand data better!`,
          readingTime: 18,
        },
        sectionName: 'Data Visualization',
        orderIndex: 9,
        estimatedMinutes: 45,
        isPublished: true,
        aiContext: 'Teaching Matplotlib: line plots, bar charts, scatter plots.',
      },
      {
        courseId: pythonCourse.id,
        title: 'Advanced Visualizations with Seaborn',
        slug: 'seaborn-visualizations',
        description: 'Create beautiful statistical visualizations',
        contentType: 'video',
        contentData: {
          url: 'https://example.com/videos/seaborn-tutorial.mp4',
          duration: 1600,
        },
        sectionName: 'Data Visualization',
        orderIndex: 10,
        estimatedMinutes: 50,
        isPublished: true,
        aiContext: 'Teaching Seaborn: heatmaps, violin plots, pair plots.',
      },

      // Section 4: Final Project
      {
        courseId: pythonCourse.id,
        title: 'Final Project: Analyze Real Data',
        slug: 'final-project-data-analysis',
        description: 'Apply everything you learned to analyze real-world data',
        contentType: 'project',
        contentData: {
          projectType: 'data-analysis',
          starterCode: `import pandas as pd
import matplotlib.pyplot as plt

# Load the dataset
df = pd.read_csv('kenya_data.csv')

# Your analysis here

`,
          requirements: [
            'Load and explore the dataset',
            'Clean the data (handle missing values)',
            'Perform statistical analysis',
            'Create at least 3 different visualizations',
            'Write a summary of your findings',
          ],
        },
        sectionName: 'Final Project',
        orderIndex: 11,
        estimatedMinutes: 180,
        isPublished: true,
        aiContext: 'Final project: Complete data analysis on Kenyan dataset.',
      },
    ]);

    console.log('✅ Python course lessons created (11 lessons)');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Sample data created:');
    console.log('  👥 Users:');
    console.log('    - Admin: admin@skillhub.co.ke (+254712345678)');
    console.log('    - Creator: creator@skillhub.co.ke (+254722222222)');
    console.log('    - Student: student@skillhub.co.ke (+254733333333)');
    console.log('\n  📚 Courses:');
    console.log('    - Web Development Fundamentals (15 lessons)');
    console.log('    - Python for Data Science (11 lessons)');
    console.log('    - Mobile App Development (coming soon)');
    console.log('\n🚀 Ready to run! Start the app with: pnpm dev');
  } catch (error) {
    console.error('❌ Seeding failed');
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
