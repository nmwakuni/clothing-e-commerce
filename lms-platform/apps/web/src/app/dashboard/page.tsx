'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lms/ui';
import { Badge } from '@lms/ui';
import { Progress } from '@lms/ui';
import { Button } from '@lms/ui';
import { Avatar } from '@lms/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lms/ui';
import { BookOpen, Clock, Trophy, TrendingUp, Play, CheckCircle2, Award, Zap } from 'lucide-react';

// Mock data (replace with actual API calls)
const userData = {
  name: 'John Kamau',
  phoneNumber: '+254712345678',
  subscriptionTier: 'premium',
  xpPoints: 3450,
  level: 7,
  streakDays: 14,
};

const enrolledCourses = [
  {
    id: '1',
    title: 'Web Development Fundamentals',
    progress: 68,
    lessonsCompleted: 28,
    totalLessons: 42,
    timeSpent: 1240, // minutes
    nextLesson: 'CSS Grid Layout',
    thumbnail: 'https://placehold.co/400x225/22c55e/white?text=Web+Dev',
  },
  {
    id: '2',
    title: 'Python for Data Science',
    progress: 35,
    lessonsCompleted: 13,
    totalLessons: 38,
    timeSpent: 620,
    nextLesson: 'Pandas DataFrames',
    thumbnail: 'https://placehold.co/400x225/3b82f6/white?text=Python',
  },
];

const achievements = [
  { id: '1', title: 'First Course', icon: '🎓', unlockedAt: '2024-01-15' },
  { id: '2', title: '7 Day Streak', icon: '🔥', unlockedAt: '2024-01-20' },
  { id: '3', title: 'Code Master', icon: '💻', unlockedAt: '2024-01-25' },
  { id: '4', title: 'Fast Learner', icon: '⚡', unlockedAt: '2024-02-01' },
];

const recentActivity = [
  { id: '1', type: 'lesson_completed', title: 'HTML Forms', course: 'Web Development', time: '2 hours ago' },
  { id: '2', type: 'quiz_passed', title: 'CSS Basics Quiz', course: 'Web Development', time: '1 day ago', score: 9 },
  { id: '3', type: 'lesson_completed', title: 'Python Lists', course: 'Python', time: '2 days ago' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                size="lg"
                fallback={userData.name}
                src={undefined}
              />
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {userData.name.split(' ')[0]}! 👋</h1>
                <p className="text-gray-600">Ready to continue learning?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="default">
                {userData.subscriptionTier === 'premium' ? '⭐ Premium' : 'Free'}
              </Badge>
              <Button variant="ghost">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="text-3xl font-bold text-green-600">{userData.level}</p>
                </div>
                <Trophy className="h-10 w-10 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{userData.xpPoints} XP</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Streak</p>
                  <p className="text-3xl font-bold text-orange-600">{userData.streakDays}</p>
                </div>
                <Zap className="h-10 w-10 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">days in a row 🔥</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Courses</p>
                  <p className="text-3xl font-bold text-blue-600">{enrolledCourses.length}</p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.floor(enrolledCourses.reduce((acc, c) => acc + c.timeSpent, 0) / 60)}h
                  </p>
                </div>
                <Clock className="h-10 w-10 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">total learning</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>
                      {course.lessonsCompleted} of {course.totalLessons} lessons completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={course.progress} showLabel />

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.floor(course.timeSpent / 60)}h {course.timeSpent % 60}m
                      </span>
                      <span>{Math.round(course.progress)}% complete</span>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-3">Next up:</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{course.nextLesson}</span>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add More Courses Card */}
              <Card className="border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Start a New Course</h3>
                  <p className="text-gray-600 mb-4">
                    Explore 100+ courses in programming, design, and business
                  </p>
                  <Button>Browse Courses</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your learning journey over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {activity.type === 'lesson_completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {activity.type === 'quiz_passed' && <Award className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.course}</p>
                            {activity.type === 'quiz_passed' && activity.score && (
                              <Badge variant="success" className="mt-1">
                                Score: {activity.score}/10
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="text-5xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold mb-1">{achievement.title}</h3>
                    <p className="text-xs text-gray-500">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {/* Locked Achievement */}
              <Card className="text-center opacity-50">
                <CardContent className="pt-6 pb-6">
                  <div className="text-5xl mb-3 filter grayscale">🎯</div>
                  <h3 className="font-bold mb-1">Complete 5 Courses</h3>
                  <p className="text-xs text-gray-500">2/5 completed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Add missing icon import
function Bell(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
