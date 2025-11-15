import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const coursesRouter = new Hono();

// GET /api/courses - List all published courses
coursesRouter.get('/', async (c) => {
  // TODO: Fetch from database
  // const { db, courses } = await import('@lms/database');
  // const allCourses = await db.select().from(courses).where(eq(courses.status, 'published'));

  // Mock data for now
  return c.json({
    courses: [
      {
        id: '1',
        title: 'Web Development Fundamentals',
        slug: 'web-development-fundamentals',
        shortDescription: 'Master web development from scratch in 6 weeks',
        thumbnailUrl: 'https://placehold.co/600x400/png?text=Web+Dev',
        difficulty: 'beginner',
        priceKes: 2000,
        enrollmentCount: 2547,
        averageRating: '4.8',
        totalLessons: 42,
        estimatedHours: '40',
      },
      {
        id: '2',
        title: 'Python for Data Science',
        slug: 'python-data-science',
        shortDescription: 'Learn Python and data analysis from scratch',
        thumbnailUrl: 'https://placehold.co/600x400/png?text=Data+Science',
        difficulty: 'beginner',
        priceKes: 2500,
        enrollmentCount: 1823,
        averageRating: '4.7',
        totalLessons: 38,
        estimatedHours: '35',
      },
    ],
    total: 2,
  });
});

// GET /api/courses/:slug - Get course by slug
coursesRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  // TODO: Fetch from database
  // Mock data for now
  if (slug === 'web-development-fundamentals') {
    return c.json({
      id: '1',
      title: 'Web Development Fundamentals',
      slug: 'web-development-fundamentals',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript...',
      shortDescription: 'Master web development from scratch in 6 weeks',
      thumbnailUrl: 'https://placehold.co/600x400/png?text=Web+Dev',
      difficulty: 'beginner',
      priceKes: 2000,
      enrollmentCount: 2547,
      averageRating: '4.8',
      reviewCount: 453,
      totalLessons: 42,
      estimatedHours: '40',
      learningOutcomes: [
        'Build responsive websites with HTML & CSS',
        'Create interactive web pages with JavaScript',
        'Deploy websites to the internet',
        'Understand how the web works',
      ],
      prerequisites: ['Basic computer skills', 'Willingness to learn'],
      lessons: [
        {
          id: '1',
          title: 'Introduction to HTML',
          sectionName: 'Getting Started',
          estimatedMinutes: 30,
          isPreview: true,
        },
        {
          id: '2',
          title: 'HTML Tags and Elements',
          sectionName: 'Getting Started',
          estimatedMinutes: 45,
          isPreview: false,
        },
      ],
    });
  }

  return c.json({ error: 'Course not found' }, 404);
});

// POST /api/courses/:id/enroll - Enroll in a course
const enrollSchema = z.object({
  userId: z.string().uuid(),
  paymentType: z.enum(['free', 'one_time', 'subscription']),
  transactionId: z.string().optional(),
});

coursesRouter.post('/:id/enroll', zValidator('json', enrollSchema), async (c) => {
  const courseId = c.req.param('id');
  const body = c.req.valid('json');

  // TODO: Create enrollment in database
  // Check if user is already enrolled
  // Process payment if required
  // Create enrollment record

  return c.json({
    success: true,
    enrollmentId: 'enr_123',
    message: 'Successfully enrolled in course',
  });
});
