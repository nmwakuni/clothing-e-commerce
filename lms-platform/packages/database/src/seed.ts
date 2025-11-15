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

    // Create sample course
    console.log('Creating courses...');
    const [webDevCourse] = await db
      .insert(courses)
      .values([
        {
          title: 'Web Development Fundamentals',
          slug: 'web-development-fundamentals',
          description:
            'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Build real projects and deploy them live.',
          shortDescription: 'Master web development from scratch in 6 weeks',
          thumbnailUrl: 'https://placehold.co/600x400/png?text=Web+Dev',
          difficulty: 'beginner',
          category: 'programming',
          tags: ['html', 'css', 'javascript', 'web'],
          priceKes: 2000,
          estimatedHours: '40',
          learningOutcomes: [
            'Build responsive websites with HTML & CSS',
            'Create interactive web pages with JavaScript',
            'Deploy websites to the internet',
            'Understand how the web works',
          ],
          prerequisites: ['Basic computer skills', 'Willingness to learn'],
          status: 'published',
          publishedAt: new Date(),
        },
      ])
      .returning();

    console.log('✅ Courses created');

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

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample data created:');
    console.log('- Admin user: admin@skillhub.co.ke (+254712345678)');
    console.log('- Creator user: creator@skillhub.co.ke (+254722222222)');
    console.log('- Student user: student@skillhub.co.ke (+254733333333)');
    console.log('- Course: Web Development Fundamentals (3 lessons)');
  } catch (error) {
    console.error('❌ Seeding failed');
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
