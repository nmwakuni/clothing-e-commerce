'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Progress, Avatar } from '@lms/ui';
import { CourseReviews } from '@/components/course-reviews';
import {
  Play,
  Clock,
  BookOpen,
  Award,
  Users,
  Star,
  CheckCircle2,
  Lock,
  BarChart,
  Calendar,
  Globe,
  Share2,
} from 'lucide-react';

// Mock data (replace with API calls)
const courseData = {
  id: '1',
  title: 'Web Development Fundamentals',
  description:
    'Master the essentials of web development with HTML, CSS, and JavaScript. Build real-world projects and learn from industry experts.',
  thumbnail: 'https://placehold.co/1200x600/22c55e/white?text=Web+Development',
  instructor: {
    name: 'Sarah Njeri',
    title: 'Senior Web Developer',
    avatar: undefined,
    bio: '10+ years building web applications. Former lead developer at Safaricom.',
    students: 12453,
    courses: 8,
  },
  stats: {
    totalLessons: 42,
    duration: 18, // hours
    level: 'Beginner',
    language: 'English & Swahili',
    students: 3421,
    rating: 4.8,
    reviews: 892,
  },
  price: {
    amount: 2500,
    currency: 'KES',
    originalPrice: 5000,
  },
  enrolled: false,
  progress: 0,
  whatYouLearn: [
    'Build responsive websites from scratch',
    'Master HTML5, CSS3, and modern JavaScript',
    'Create interactive web applications',
    'Understand web development best practices',
    'Deploy projects to the internet',
    'Build a professional portfolio',
  ],
  requirements: [
    'A computer with internet connection',
    'No prior coding experience needed',
    'Willingness to learn and practice',
  ],
  modules: [
    {
      id: 'm1',
      title: 'HTML Fundamentals',
      lessons: [
        { id: '1', title: 'Introduction to HTML', type: 'video', duration: 15, free: true },
        { id: '2', title: 'HTML Structure', type: 'text', duration: 10, free: true },
        { id: '3', title: 'Build Your First Page', type: 'interactive', duration: 20, free: false },
        { id: '4', title: 'HTML Quiz', type: 'quiz', duration: 15, free: false },
      ],
    },
    {
      id: 'm2',
      title: 'CSS Styling',
      lessons: [
        { id: '5', title: 'Introduction to CSS', type: 'video', duration: 18, free: false },
        { id: '6', title: 'CSS Selectors', type: 'text', duration: 12, free: false },
        { id: '7', title: 'Style a Webpage', type: 'interactive', duration: 25, free: false },
        { id: '8', title: 'CSS Flexbox', type: 'video', duration: 22, free: false },
        { id: '9', title: 'CSS Grid Layout', type: 'video', duration: 20, free: false },
      ],
    },
    {
      id: 'm3',
      title: 'JavaScript Basics',
      lessons: [
        { id: '10', title: 'Introduction to JavaScript', type: 'video', duration: 20, free: false },
        { id: '11', title: 'Variables and Data Types', type: 'text', duration: 15, free: false },
        { id: '12', title: 'Build a Calculator', type: 'interactive', duration: 30, free: false },
      ],
    },
    {
      id: 'm4',
      title: 'Final Project',
      lessons: [
        {
          id: '13',
          title: 'Build a Complete Website',
          type: 'project',
          duration: 120,
          free: false,
        },
      ],
    },
  ],
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(['m1']);

  const handleEnroll = async () => {
    setEnrollmentLoading(true);
    // TODO: Integrate with payments API
    setTimeout(() => {
      setEnrollmentLoading(false);
      router.push(`/checkout/${courseId}`);
    }, 500);
  };

  const handleStartLearning = () => {
    // Find first lesson
    const firstLesson = courseData.modules[0].lessons[0];
    router.push(`/courses/${courseId}/lessons/${firstLesson.id}`);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge variant="outline" className="mb-4 border-white text-white">
                {courseData.stats.level}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
              <p className="text-xl text-green-50 mb-6">{courseData.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-green-50">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{courseData.stats.rating}</span>
                  <span>({courseData.stats.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{courseData.stats.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{courseData.stats.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>{courseData.stats.language}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Avatar
                  size="md"
                  fallback={courseData.instructor.name}
                  src={courseData.instructor.avatar}
                />
                <div>
                  <p className="font-medium">Created by {courseData.instructor.name}</p>
                  <p className="text-sm text-green-50">{courseData.instructor.title}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <img
                    src={courseData.thumbnail}
                    alt={courseData.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />

                  {courseData.enrolled ? (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Your Progress</span>
                          <span className="text-sm font-bold">{courseData.progress}%</span>
                        </div>
                        <Progress value={courseData.progress} showLabel={false} />
                      </div>
                      <Button className="w-full" size="lg" onClick={handleStartLearning}>
                        <Play className="h-5 w-5 mr-2" />
                        Continue Learning
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">
                            {formatPrice(courseData.price.amount)}
                          </span>
                          {courseData.price.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {formatPrice(courseData.price.originalPrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          50% off - Limited time offer!
                        </p>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleEnroll}
                        loading={enrollmentLoading}
                      >
                        Enroll Now - Pay via M-Pesa
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-3">
                        30-day money-back guarantee
                      </p>
                    </>
                  )}

                  <div className="mt-6 pt-6 border-t space-y-3">
                    <h4 className="font-bold text-sm">This course includes:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{courseData.stats.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        <span>{courseData.stats.duration} hours of video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Learn via WhatsApp</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Course
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseData.whatYouLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content / Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {courseData.modules.length} modules •{' '}
                  {courseData.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courseData.modules.map((module) => {
                    const isExpanded = expandedModules.includes(module.id);
                    const moduleDuration = module.lessons.reduce((acc, l) => acc + l.duration, 0);

                    return (
                      <div key={module.id} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`transform transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            >
                              ▶
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold">{module.title}</h4>
                              <p className="text-sm text-gray-600">
                                {module.lessons.length} lessons • {Math.floor(moduleDuration / 60)}h{' '}
                                {moduleDuration % 60}m
                              </p>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t bg-gray-50">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="p-4 pl-12 border-b last:border-0 hover:bg-white transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <Play className="h-4 w-4 text-gray-400" />
                                  <span className="flex-1">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {lesson.free && (
                                    <Badge variant="success" className="text-xs">
                                      Free Preview
                                    </Badge>
                                  )}
                                  {!lesson.free && !courseData.enrolled && (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className="text-sm text-gray-600">{lesson.duration}m</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {courseData.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar
                    size="xl"
                    fallback={courseData.instructor.name}
                    src={courseData.instructor.avatar}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{courseData.instructor.name}</h3>
                    <p className="text-gray-600 mb-3">{courseData.instructor.title}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{courseData.instructor.students.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{courseData.instructor.courses} courses</span>
                      </div>
                    </div>

                    <p className="text-gray-700">{courseData.instructor.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Reviews */}
            <CourseReviews
              courseId={courseId}
              averageRating={courseData.stats.rating}
              totalReviews={courseData.stats.reviews}
              enrolled={courseData.enrolled}
            />
          </div>

          {/* Sidebar - Sticky on desktop (hidden on mobile as card is in hero) */}
          <div className="lg:col-span-1 hidden lg:block">
            {/* Empty - enrollment card is sticky in hero section */}
          </div>
        </div>
      </div>
    </div>
  );
}
