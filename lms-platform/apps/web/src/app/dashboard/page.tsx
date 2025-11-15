'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lms/ui';
import { Badge } from '@lms/ui';
import { Progress } from '@lms/ui';
import { Button } from '@lms/ui';
import { Avatar } from '@lms/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lms/ui';
import { BookOpen, Clock, Trophy, TrendingUp, Play, CheckCircle2, Award, Zap, Loader } from 'lucide-react';
import { authAPI, coursesAPI, isAuthenticated } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user data
      const userData = await authAPI.getMe();
      setUser(userData.user);

      // Load user's enrollments with progress
      // Since we don't have a single endpoint for all enrollments,
      // we'll need to fetch them differently or add that endpoint
      // For now, using mock data structure but with real user data
      setEnrollments([]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // If unauthorized, redirect to login
      if ((error as any)?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate stats
  const totalCourses = enrollments.length;
  const totalTimeMinutes = enrollments.reduce((sum, e) => sum + (e.timeSpent || 0), 0);
  const totalHours = Math.floor(totalTimeMinutes / 60);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Avatar
              size="xl"
              fallback={user.fullName || user.phoneNumber}
              src={user.profilePictureUrl}
            />
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user.fullName?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-gray-600">Ready to continue your learning journey?</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="text-3xl font-bold text-green-600">{user.level || 1}</p>
                </div>
                <Trophy className="h-10 w-10 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{user.xpPoints || 0} XP</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Streak</p>
                  <p className="text-3xl font-bold text-orange-600">{user.streakDays || 0}</p>
                </div>
                <Zap className="h-10 w-10 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Courses</p>
                  <p className="text-3xl font-bold text-blue-600">{totalCourses}</p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-3xl font-bold text-purple-600">{totalHours}h</p>
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

          <TabsContent value="courses">
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Button onClick={() => router.push('/courses')}>
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={enrollment.course.thumbnailUrl || 'https://placehold.co/400x225/22c55e/white?text=Course'}
                      alt={enrollment.course.title}
                      className="w-full h-48 object-cover"
                    />
                    <CardHeader>
                      <CardTitle>{enrollment.course.title}</CardTitle>
                      <CardDescription>
                        {enrollment.lessonsCompleted || 0} of {enrollment.course.totalLessons} lessons completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={enrollment.progressPercentage || 0} showLabel />

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor((enrollment.timeSpent || 0) / 60)}h learned</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{enrollment.progressPercentage || 0}% complete</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-3">Next up:</p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{enrollment.nextLesson || 'Start course'}</span>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/courses/${enrollment.courseId}`)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your learning progress over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-center text-gray-500 py-8">
                    No recent activity to display
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Unlock achievements as you learn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p>Complete courses and challenges to earn achievements!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
