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

    // Create sample lessons
    console.log('Creating lessons...');
    await db.insert(lessons).values([
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
HTML (HyperText Markup Language) is the standard language for creating web pages...`,
          readingTime: 15,
        },
        sectionName: 'Getting Started',
        orderIndex: 1,
        estimatedMinutes: 30,
        isPreview: true,
        isPublished: true,
        aiContext:
          'This lesson introduces HTML basics. Help students understand tags, elements, and basic page structure.',
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

</body>
</html>`,
          tests: [
            {
              description: 'Page should have an h1 tag',
              test: 'document.querySelector("h1")',
            },
          ],
        },
        sectionName: 'Getting Started',
        orderIndex: 2,
        estimatedMinutes: 45,
        isPublished: true,
        aiContext:
          'Students practice writing HTML tags. Help them understand proper nesting and common tags like h1, p, div, etc.',
      },
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
        sectionName: 'Styling with CSS',
        orderIndex: 3,
        estimatedMinutes: 60,
        isPublished: true,
        aiContext: 'Introduction to CSS selectors, properties, and values.',
      },
    ]);

    console.log('✅ Lessons created');

    // Add more lessons for Python course
    await db.insert(lessons).values([
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
        estimatedMinutes: 20,
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
          markdown: '# Variables in Python\n\nLearn about Python variables and data types...',
          readingTime: 15,
        },
        sectionName: 'Python Basics',
        orderIndex: 2,
        estimatedMinutes: 25,
        isPreview: true,
        isPublished: true,
        aiContext: 'Python variables, strings, numbers, booleans.',
      },
    ]);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Sample data created:');
    console.log('  👥 Users:');
    console.log('    - Admin: admin@skillhub.co.ke (+254712345678)');
    console.log('    - Creator: creator@skillhub.co.ke (+254722222222)');
    console.log('    - Student: student@skillhub.co.ke (+254733333333)');
    console.log('\n  📚 Courses:');
    console.log('    - Web Development Fundamentals (3 lessons)');
    console.log('    - Python for Data Science (2 lessons)');
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
