'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Input } from '@lms/ui';
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  Clock,
  Star,
  Video,
  FileText,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { authAPI } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  students: number;
  revenue: number;
  rating: number;
  reviews: number;
  lessons: number;
  lastUpdated: string;
}

export default function CreatorStudioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'analytics' | 'earnings'>('courses');
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Web Development Fundamentals',
      slug: 'web-development-fundamentals',
      thumbnail: 'https://placehold.co/400x200/22c55e/white?text=Web+Dev',
      status: 'published',
      students: 3421,
      revenue: 8552500,
      rating: 4.8,
      reviews: 892,
      lessons: 42,
      lastUpdated: '2024-01-15',
    },
    {
      id: '2',
      title: 'Python for Data Science',
      slug: 'python-data-science',
      thumbnail: 'https://placehold.co/400x200/3b82f6/white?text=Python',
      status: 'published',
      students: 1823,
      revenue: 5469000,
      rating: 4.7,
      reviews: 456,
      lessons: 38,
      lastUpdated: '2024-01-14',
    },
    {
      id: '3',
      title: 'Advanced React Patterns',
      slug: 'advanced-react-patterns',
      thumbnail: 'https://placehold.co/400x200/8b5cf6/white?text=React',
      status: 'draft',
      students: 0,
      revenue: 0,
      rating: 0,
      reviews: 0,
      lessons: 12,
      lastUpdated: '2024-01-10',
    },
  ]);

  const [stats, setStats] = useState({
    totalStudents: 5244,
    totalRevenue: 14021500,
    averageRating: 4.75,
    totalCourses: 3,
    monthlyEarnings: 2450000,
    pendingPayouts: 9814050,
  });

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getMe();
      setUser(userData.user);

      // Check if user is a creator
      if (userData.user.role !== 'creator' && userData.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // TODO: Fetch real creator data from API
      // const coursesData = await creatorAPI.getCourses();
      // setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load creator data:', error);
      if ((error as any)?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateCourse = () => {
    router.push('/creator/new');
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/creator/courses/${courseId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Studio</h1>
            <p className="text-gray-600">Manage your courses and track your earnings</p>
          </div>
          <Button onClick={handleCreateCourse} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create New Course
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+234 this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>70% revenue share</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <p className="text-3xl font-bold">{stats.averageRating}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>Across all courses</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Payout</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.pendingPayouts)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm">Request Payout</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'courses'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="h-5 w-5 inline mr-2" />
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-5 w-5 inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'earnings'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="h-5 w-5 inline mr-2" />
            Earnings
          </button>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{course.title}</h3>
                            <Badge
                              variant={
                                course.status === 'published'
                                  ? 'success'
                                  : course.status === 'draft'
                                  ? 'outline'
                                  : 'default'
                              }
                            >
                              {course.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{course.lessons} lessons</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCourse(course.id)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Students</p>
                          <p className="text-2xl font-bold">{course.students.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Revenue</p>
                          <p className="text-2xl font-bold">{formatCurrency(course.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold">{course.rating || 'N/A'}</span>
                            {course.reviews > 0 && (
                              <span className="text-sm text-gray-600">({course.reviews})</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                          <p className="text-sm font-medium">
                            {new Date(course.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Student Growth</CardTitle>
                <CardDescription>Monthly student enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['January', 'February', 'March', 'April', 'May'].map((month, idx) => {
                    const students = [450, 520, 680, 790, 850][idx];
                    const maxStudents = 850;
                    return (
                      <div key={month}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{month}</span>
                          <span className="text-sm text-gray-600">{students} students</span>
                        </div>
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="absolute h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                            style={{ width: `${(students / maxStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Courses</CardTitle>
                <CardDescription>By student enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses
                    .sort((a, b) => b.students - a.students)
                    .map((course) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-600">
                            {course.students.toLocaleString()} students
                          </p>
                        </div>
                        <Badge variant="success">{formatCurrency(course.revenue)}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">This Month</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(stats.monthlyEarnings)}
                    </p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-6 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Available for Payout</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {formatCurrency(stats.pendingPayouts)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Recent withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: '2024-01-01', amount: 1200000, status: 'completed' },
                    { date: '2023-12-01', amount: 980000, status: 'completed' },
                    { date: '2023-11-01', amount: 1450000, status: 'completed' },
                    { date: '2023-10-01', amount: 890000, status: 'completed' },
                  ].map((payout, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatCurrency(payout.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payout.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
