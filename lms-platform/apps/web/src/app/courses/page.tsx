'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Input } from '@lms/ui';
import { Search, Filter, Star, Users, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { coursesAPI } from '@/lib/api';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, [selectedCategory, selectedDifficulty]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      if (selectedDifficulty !== 'all') {
        filters.difficulty = selectedDifficulty;
      }

      const data = await coursesAPI.listCourses(filters);
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to load courses:', error);
      // Fallback to empty array on error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'default';
      case 'advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Learn New Skills, Advance Your Career
            </h1>
            <p className="text-xl text-green-50 mb-8">
              Browse our collection of expert-led courses designed for the African market
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex items-center max-w-2xl mx-auto">
              <Search className="h-5 w-5 text-gray-400 ml-2" />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus:ring-0 flex-1"
              />
              <Button>Search</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
              <div>
                <p className="text-3xl font-bold">{courses.length}+</p>
                <p className="text-green-50">Courses</p>
              </div>
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-green-50">Students</p>
              </div>
              <div>
                <p className="text-3xl font-bold">4.8★</p>
                <p className="text-green-50">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Difficulty Filter */}
                <div>
                  <h3 className="font-bold mb-3">Difficulty</h3>
                  <div className="space-y-2">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedDifficulty(level)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedDifficulty === level
                            ? 'bg-green-50 text-green-600 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="font-bold mb-3">Category</h3>
                  <div className="space-y-2">
                    {[
                      'all',
                      'web-development',
                      'mobile-development',
                      'data-science',
                      'design',
                      'business',
                    ].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? 'bg-green-50 text-green-600 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''}
              </h2>
              <select className="px-4 py-2 border rounded-lg">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Highest Rated</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <CardContent className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No courses found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search query
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => router.push(`/courses/${course.slug || course.id}`)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnailUrl || 'https://placehold.co/600x400/22c55e/white?text=Course'}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.difficulty && (
                        <Badge
                          variant={getDifficultyColor(course.difficulty) as any}
                          className="absolute top-3 right-3"
                        >
                          {course.difficulty}
                        </Badge>
                      )}
                    </div>

                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.shortDescription}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Course Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {course.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.averageRating}</span>
                          </div>
                        )}
                        {course.enrollmentCount && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.enrollmentCount.toLocaleString()}</span>
                          </div>
                        )}
                        {course.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.estimatedHours}h</span>
                          </div>
                        )}
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          {course.priceKes ? (
                            <p className="text-2xl font-bold text-green-600">
                              {formatPrice(course.priceKes)}
                            </p>
                          ) : (
                            <Badge variant="success">Free</Badge>
                          )}
                        </div>
                        <Button size="sm">View Course</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
