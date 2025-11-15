'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@lms/ui';
import { Save, ArrowLeft } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('programming');
  const [courseLevel, setCourseLevel] = useState('beginner');

  const handleCreateCourse = async () => {
    setCreating(true);
    // TODO: Create course via API
    setTimeout(() => {
      setCreating(false);
      router.push('/creator');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <Button variant="outline" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-gray-600 mb-8">Let's start with the basics</p>

          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Tell us about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Course Title *</label>
                <Input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g., Web Development Fundamentals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[120px]"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Describe what students will learn in this course"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                  >
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="data-science">Data Science</option>
                    <option value="marketing">Marketing</option>
                    <option value="mobile-dev">Mobile Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Level *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCourse}
                  loading={creating}
                  disabled={!courseTitle || !courseDescription}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
