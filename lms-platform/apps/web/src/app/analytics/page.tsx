'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
} from '@lms/ui';
import {
  TrendingUp,
  Clock,
  Award,
  Target,
  Calendar,
  BookOpen,
  Brain,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
} from 'lucide-react';
import { authAPI } from '@/lib/api';

interface AnalyticsData {
  overview: {
    totalHoursLearned: number;
    coursesCompleted: number;
    currentStreak: number;
    xpEarned: number;
    averageScore: number;
    lessonsCompleted: number;
  };
  weeklyActivity: Array<{
    day: string;
    hours: number;
    lessons: number;
  }>;
  courseProgress: Array<{
    courseTitle: string;
    progress: number;
    lastAccessed: string;
    timeSpent: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  skillsProgress: Array<{
    skill: string;
    level: number;
    xp: number;
    nextLevelXp: number;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalHoursLearned: 47,
      coursesCompleted: 3,
      currentStreak: 12,
      xpEarned: 4250,
      averageScore: 87,
      lessonsCompleted: 28,
    },
    weeklyActivity: [
      { day: 'Mon', hours: 2.5, lessons: 3 },
      { day: 'Tue', hours: 1.8, lessons: 2 },
      { day: 'Wed', hours: 3.2, lessons: 4 },
      { day: 'Thu', hours: 2.1, lessons: 3 },
      { day: 'Fri', hours: 1.5, lessons: 2 },
      { day: 'Sat', hours: 4.0, lessons: 5 },
      { day: 'Sun', hours: 3.5, lessons: 4 },
    ],
    courseProgress: [
      {
        courseTitle: 'Web Development Fundamentals',
        progress: 75,
        lastAccessed: '2024-01-15',
        timeSpent: 18,
      },
      {
        courseTitle: 'Python for Data Science',
        progress: 45,
        lastAccessed: '2024-01-14',
        timeSpent: 12,
      },
      {
        courseTitle: 'Mobile App Development',
        progress: 20,
        lastAccessed: '2024-01-10',
        timeSpent: 8,
      },
    ],
    achievements: [
      {
        id: '1',
        title: 'First Steps',
        description: 'Completed your first lesson',
        icon: '🎯',
        unlockedAt: '2024-01-01',
      },
      {
        id: '2',
        title: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        unlockedAt: '2024-01-08',
      },
      {
        id: '3',
        title: 'Quick Learner',
        description: 'Completed 10 lessons in one week',
        icon: '⚡',
        unlockedAt: '2024-01-12',
      },
      {
        id: '4',
        title: 'Code Master',
        description: 'Scored 100% on 5 coding exercises',
        icon: '💻',
        unlockedAt: '2024-01-14',
      },
    ],
    skillsProgress: [
      { skill: 'HTML/CSS', level: 5, xp: 850, nextLevelXp: 1000 },
      { skill: 'JavaScript', level: 4, xp: 620, nextLevelXp: 800 },
      { skill: 'Python', level: 3, xp: 450, nextLevelXp: 600 },
      { skill: 'Data Analysis', level: 2, xp: 280, nextLevelXp: 400 },
    ],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getMe();
      setUser(userData.user);

      // TODO: Fetch real analytics from API
      // const analyticsData = await analyticsAPI.getAnalytics();
      // setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      if ((error as any)?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
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

  const maxHours = Math.max(...analytics.weeklyActivity.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Analytics</h1>
          <p className="text-gray-600">Track your progress and achievements</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                  <p className="text-3xl font-bold">{analytics.overview.totalHoursLearned}h</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold">{analytics.overview.currentStreak} days</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>Keep it up!</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">XP Earned</p>
                  <p className="text-3xl font-bold">
                    {analytics.overview.xpEarned.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>Level {user?.level || 1}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold">{analytics.overview.averageScore}%</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+5% improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Your learning hours this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyActivity.map((day) => (
                  <div key={day.day}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{day.day}</span>
                      <span className="text-sm text-gray-600">
                        {day.hours}h • {day.lessons} lessons
                      </span>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                        style={{ width: `${(day.hours / maxHours) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Progress
              </CardTitle>
              <CardDescription>Your enrolled courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.courseProgress.map((course, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{course.courseTitle}</h4>
                      <span className="text-sm text-gray-600">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} showLabel={false} />
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{course.timeSpent}h spent</span>
                      <span>Last: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skills Progress
              </CardTitle>
              <CardDescription>Master new skills as you learn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.skillsProgress.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{skill.skill}</h4>
                        <p className="text-xs text-gray-500">Level {skill.level}</p>
                      </div>
                      <Badge variant="outline">{skill.xp} XP</Badge>
                    </div>
                    <div className="relative">
                      <Progress value={(skill.xp / skill.nextLevelXp) * 100} showLabel={false} />
                      <p className="text-xs text-gray-500 mt-1">
                        {skill.nextLevelXp - skill.xp} XP to level {skill.level + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Milestones you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg"
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Learning Insights
            </CardTitle>
            <CardDescription>AI-powered recommendations for your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold mb-2">🎯 Best Learning Time</h4>
                <p className="text-sm text-gray-700">
                  You're most productive on Saturdays between 9-11 AM. Schedule challenging lessons
                  during this time.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-bold mb-2">📈 Strength</h4>
                <p className="text-sm text-gray-700">
                  You excel at coding exercises! Your average score on interactive lessons is 92%.
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-bold mb-2">💡 Recommendation</h4>
                <p className="text-sm text-gray-700">
                  Try reviewing concepts from 2 weeks ago to strengthen long-term retention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
