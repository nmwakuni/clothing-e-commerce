import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '@lms/database';
import { courses, lessons, enrollments, progress } from '@lms/database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createAuthService, createAuthMiddleware } from '@lms/auth';

export const coursesRouter = new Hono<{
  Bindings: { JWT_SECRET: string };
  Variables: { user: any };
}>();

// GET /api/courses - List all published courses
coursesRouter.get('/', async (c) => {
  try {
    const category = c.req.query('category');
    const difficulty = c.req.query('difficulty');

    let query = db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        shortDescription: courses.shortDescription,
        thumbnailUrl: courses.thumbnailUrl,
        difficulty: courses.difficulty,
        priceKes: courses.priceKes,
        enrollmentCount: courses.enrollmentCount,
        averageRating: courses.averageRating,
        totalLessons: courses.totalLessons,
        estimatedHours: courses.estimatedHours,
      })
      .from(courses)
      .where(eq(courses.status, 'published'))
      .orderBy(desc(courses.enrollmentCount));

    // Apply filters
    // TODO: Add category and difficulty filtering

    const allCourses = await query;

    return c.json({
      courses: allCourses,
      total: allCourses.length,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return c.json({ error: 'Failed to fetch courses' }, 500);
  }
});

// GET /api/courses/:slug - Get course by slug
coursesRouter.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    // Fetch course
    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.orderIndex)],
        },
      },
    });

    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    if (course.status !== 'published') {
      return c.json({ error: 'Course not available' }, 403);
    }

    return c.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return c.json({ error: 'Failed to fetch course' }, 500);
  }
});

// POST /api/courses/:id/enroll - Enroll in a course (requires auth)
const enrollSchema = z.object({
  transactionId: z.string().optional(),
});

coursesRouter.post('/:id/enroll', zValidator('json', enrollSchema), async (c) => {
  try {
    // Get auth middleware
    const auth = createAuthService({ jwtSecret: c.env.JWT_SECRET });
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = auth.extractTokenFromHeader(authHeader);
    const user = await auth.verifyToken(token);

    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const courseId = c.req.param('id');
    const body = c.req.valid('json');

    // Check if course exists
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    // Check if already enrolled
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, user.userId), eq(enrollments.courseId, courseId)),
    });

    if (existingEnrollment) {
      return c.json({ error: 'Already enrolled in this course' }, 400);
    }

    // Create enrollment
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId: user.userId,
        courseId,
        status: 'active',
      })
      .returning();

    return c.json({
      success: true,
      enrollmentId: enrollment.id,
      message: 'Successfully enrolled in course',
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return c.json({ error: 'Failed to enroll in course' }, 500);
  }
});

// GET /api/courses/:id/progress - Get user's progress in a course (requires auth)
coursesRouter.get('/:id/progress', async (c) => {
  try {
    const auth = createAuthService({ jwtSecret: c.env.JWT_SECRET });
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = auth.extractTokenFromHeader(authHeader);
    const user = await auth.verifyToken(token);

    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const courseId = c.req.param('id');

    // Get enrollment
    const enrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, user.userId), eq(enrollments.courseId, courseId)),
    });

    if (!enrollment) {
      return c.json({ error: 'Not enrolled in this course' }, 404);
    }

    // Get all progress records for this enrollment
    const progressRecords = await db.query.progress.findMany({
      where: eq(progress.enrollmentId, enrollment.id),
    });

    return c.json({
      enrollment,
      progress: progressRecords,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

// POST /api/courses/:courseId/lessons/:lessonId/complete - Mark lesson as complete (requires auth)
const completeSchema = z.object({
  timeSpentSeconds: z.number().optional(),
});

coursesRouter.post('/:courseId/lessons/:lessonId/complete', zValidator('json', completeSchema), async (c) => {
  try {
    const auth = createAuthService({ jwtSecret: c.env.JWT_SECRET });
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = auth.extractTokenFromHeader(authHeader);
    const user = await auth.verifyToken(token);

    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const courseId = c.req.param('courseId');
    const lessonId = c.req.param('lessonId');
    const body = c.req.valid('json');

    // Get enrollment
    const enrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, user.userId), eq(enrollments.courseId, courseId)),
    });

    if (!enrollment) {
      return c.json({ error: 'Not enrolled in this course' }, 404);
    }

    // Check if progress record exists
    const existingProgress = await db.query.progress.findFirst({
      where: and(eq(progress.enrollmentId, enrollment.id), eq(progress.lessonId, lessonId)),
    });

    if (existingProgress) {
      // Update existing progress
      await db
        .update(progress)
        .set({
          status: 'completed',
          completionPercentage: 100,
          timeSpentSeconds: body.timeSpentSeconds || existingProgress.timeSpentSeconds,
          completedAt: new Date(),
        })
        .where(eq(progress.id, existingProgress.id));
    } else {
      // Create new progress record
      await db.insert(progress).values({
        enrollmentId: enrollment.id,
        lessonId,
        status: 'completed',
        completionPercentage: 100,
        timeSpentSeconds: body.timeSpentSeconds || 0,
        completedAt: new Date(),
      });
    }

    // Update enrollment progress
    const totalLessons = await db.query.lessons.findMany({
      where: eq(lessons.courseId, courseId),
    });

    const completedLessons = await db.query.progress.findMany({
      where: and(eq(progress.enrollmentId, enrollment.id), eq(progress.status, 'completed')),
    });

    const progressPercentage = Math.floor((completedLessons.length / totalLessons.length) * 100);

    await db
      .update(enrollments)
      .set({
        progressPercentage,
        lastAccessedAt: new Date(),
      })
      .where(eq(enrollments.id, enrollment.id));

    return c.json({
      success: true,
      message: 'Lesson marked as complete',
      progressPercentage,
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    return c.json({ error: 'Failed to mark lesson complete' }, 500);
  }
});
