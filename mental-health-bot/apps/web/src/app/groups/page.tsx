'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  currentMembers: number;
  maxMembers: number;
  moderator: string;
  meetingSchedule: string;
  isPrivate: boolean;
}

const sampleGroups: SupportGroup[] = [
  {
    id: '1',
    name: 'Anxiety Warriors',
    description:
      'A supportive community for individuals dealing with anxiety. Share coping strategies and support each other.',
    topic: 'anxiety',
    currentMembers: 24,
    maxMembers: 30,
    moderator: 'Dr. Amina Wanjiru',
    meetingSchedule: 'Mondays & Thursdays, 7PM EAT',
    isPrivate: false,
  },
  {
    id: '2',
    name: 'Depression Support Circle',
    description:
      'A safe space to discuss depression, share experiences, and find hope together.',
    topic: 'depression',
    currentMembers: 18,
    maxMembers: 25,
    moderator: 'Dr. James Omondi',
    meetingSchedule: 'Wednesdays, 6PM EAT',
    isPrivate: false,
  },
  {
    id: '3',
    name: 'Young Professionals Mental Health',
    description:
      'Navigate work stress, career pressure, and maintain mental wellness in your professional journey.',
    topic: 'general',
    currentMembers: 32,
    maxMembers: 40,
    moderator: 'Dr. Grace Mutua',
    meetingSchedule: 'Tuesdays, 8PM EAT',
    isPrivate: false,
  },
  {
    id: '4',
    name: 'Grief & Loss Support',
    description:
      'Find comfort and understanding while navigating grief. Honor your loved ones and heal together.',
    topic: 'grief',
    currentMembers: 15,
    maxMembers: 20,
    moderator: 'Community Moderator',
    meetingSchedule: 'Fridays, 7PM EAT',
    isPrivate: false,
  },
  {
    id: '5',
    name: 'LGBTQ+ Mental Wellness',
    description:
      'Affirming space for LGBTQ+ individuals to discuss mental health, identity, and community.',
    topic: 'lgbtq',
    currentMembers: 12,
    maxMembers: 20,
    moderator: 'Dr. Grace Mutua',
    meetingSchedule: 'Saturdays, 5PM EAT',
    isPrivate: true,
  },
  {
    id: '6',
    name: 'Parents Mental Health Circle',
    description:
      'Supporting parents through the joys and challenges of raising children while caring for your mental health.',
    topic: 'parenting',
    currentMembers: 20,
    maxMembers: 30,
    moderator: 'Community Moderator',
    meetingSchedule: 'Sundays, 4PM EAT',
    isPrivate: false,
  },
];

export default function SupportGroupsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const topics = ['all', 'anxiety', 'depression', 'grief', 'lgbtq', 'parenting', 'general'];

  const filteredGroups = sampleGroups.filter(
    (group) => selectedTopic === 'all' || group.topic === selectedTopic
  );

  const topicIcons: Record<string, string> = {
    anxiety: '😰',
    depression: '🌧️',
    grief: '🕊️',
    lgbtq: '🏳️‍🌈',
    parenting: '👨‍👩‍👧‍👦',
    general: '💬',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Support Groups 👥
          </h1>
          <p className="text-xl text-gray-600">
            Find your community and heal together through peer support
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-900 mb-3">
            Why Join a Support Group?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">
                🤝 Shared Experience
              </h3>
              <p className="text-purple-700 text-sm">
                Connect with others who truly understand what you're going through
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">
                💪 Mutual Support
              </h3>
              <p className="text-purple-700 text-sm">
                Give and receive support in a safe, moderated environment
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">🌱 Growth Together</h3>
              <p className="text-purple-700 text-sm">
                Learn coping strategies and celebrate progress as a community
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8 flex justify-center">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} padding="lg" hover>
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{topicIcons[group.topic]}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h3>
                {group.isPrivate && <Badge variant="warning">Private</Badge>}
              </div>

              <p className="text-gray-700 mb-4 text-center">{group.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-semibold">
                    {group.currentMembers}/{group.maxMembers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${(group.currentMembers / group.maxMembers) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Moderator:</span>
                  <span className="font-semibold">{group.moderator}</span>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-purple-900 font-medium text-center">
                    📅 {group.meetingSchedule}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                disabled={group.currentMembers >= group.maxMembers}
              >
                {group.currentMembers >= group.maxMembers ? 'Group Full' : 'Join Group'}
              </Button>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No support groups found for this topic.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Want to Start Your Own Group?</h2>
          <p className="text-xl mb-6">
            Create a support group for your community and become a peer leader
          </p>
          <Button variant="secondary" size="lg">
            Create Support Group
          </Button>
        </div>
      </div>
    </div>
  );
}
