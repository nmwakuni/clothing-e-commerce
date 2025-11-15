'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui';

interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'podcast' | 'worksheet' | 'meditation' | 'breathing_exercise' | 'hotline';
  category: 'anxiety' | 'depression' | 'stress' | 'trauma' | 'relationships' | 'self_care' | 'crisis';
  content: string;
  estimatedTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

const crisisHotlines = [
  {
    name: 'Kenya Red Cross Hotline',
    number: '+254 722 178 177',
    available: '24/7',
    services: 'Crisis counseling, emotional support',
  },
  {
    name: 'Befrienders Kenya',
    number: '+254 722 178 177',
    available: '24/7',
    services: 'Suicide prevention, emotional support',
  },
  {
    name: 'Mental Health Association of Kenya (MHAK)',
    number: '0800 720 020',
    available: '24/7',
    services: 'Mental health support, referrals',
  },
  {
    name: 'Gender Violence Recovery Centre',
    number: '+254 709 738 000',
    available: '24/7',
    services: 'GBV support, counseling',
  },
  {
    name: 'Emergency Services',
    number: '999',
    available: '24/7',
    services: 'Police, ambulance, fire',
  },
];

const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Understanding Anxiety: A Guide for Kenyans',
    type: 'article',
    category: 'anxiety',
    content: 'Learn about anxiety symptoms and coping strategies tailored to African contexts.',
    estimatedTime: 10,
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: '5-Minute Breathing Exercise',
    type: 'breathing_exercise',
    category: 'stress',
    content: 'Quick breathing technique to calm your mind and reduce stress.',
    estimatedTime: 5,
    difficulty: 'beginner',
  },
  {
    id: '3',
    title: 'Guided Meditation for Sleep',
    type: 'meditation',
    category: 'self_care',
    content: 'Relax your body and mind with this soothing meditation.',
    estimatedTime: 15,
    difficulty: 'beginner',
  },
  {
    id: '4',
    title: 'Dealing with Depression in African Communities',
    type: 'article',
    category: 'depression',
    content: 'Understanding depression and navigating cultural stigma.',
    estimatedTime: 12,
    difficulty: 'intermediate',
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const categories = ['all', 'anxiety', 'depression', 'stress', 'trauma', 'relationships', 'self_care', 'crisis'];
  const types = ['all', 'article', 'video', 'podcast', 'worksheet', 'meditation', 'breathing_exercise'];

  const filteredResources = sampleResources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const typeIcons: Record<string, string> = {
    article: '📖',
    video: '🎥',
    podcast: '🎧',
    worksheet: '📝',
    meditation: '🧘',
    breathing_exercise: '🌬️',
    hotline: '📞',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Crisis Banner */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-800 mb-4">🆘 Crisis Hotlines - Available 24/7</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crisisHotlines.map((hotline, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">{hotline.name}</h3>
                <a
                  href={`tel:${hotline.number}`}
                  className="text-2xl font-bold text-red-600 hover:text-red-700 block mb-1"
                >
                  {hotline.number}
                </a>
                <p className="text-sm text-gray-600 mb-1">
                  Available: {hotline.available}
                </p>
                <p className="text-sm text-gray-500">{hotline.services}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Mental Health Resources 📚
          </h1>
          <p className="text-xl text-gray-600">
            Evidence-based resources for your mental wellness journey
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} hover>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-4xl">{typeIcons[resource.type]}</span>
                  <Badge variant="info">
                    {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                  </Badge>
                </div>
                <CardTitle>{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{resource.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  {resource.estimatedTime && (
                    <span>⏱️ {resource.estimatedTime} min</span>
                  )}
                  {resource.difficulty && (
                    <Badge variant="default">{resource.difficulty}</Badge>
                  )}
                </div>
                <Button variant="primary" className="w-full">
                  View Resource
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No resources found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
