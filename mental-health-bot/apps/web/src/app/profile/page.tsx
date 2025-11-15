'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Badge,
  Alert,
} from '@/components/ui';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);

  // Mock user data
  const [profile, setProfile] = useState({
    name: 'Anonymous User',
    email: 'user@example.com',
    displayName: 'WellnessSeeker',
    isAnonymous: true,
    phoneNumber: '+254 7XX XXX XXX',
    primaryConcerns: ['Anxiety', 'Stress'],
    triggers: ['Work pressure', 'Social situations'],
    copingStrategies: ['Deep breathing', 'Journaling', 'Walking'],
  });

  const [stats] = useState({
    memberSince: '2024-01-15',
    journalEntries: 45,
    therapySessions: 12,
    currentStreak: 7,
    moodAverage: 6.8,
    hasSafetyPlan: true,
  });

  const [safetyPlan] = useState({
    warningSigns: [
      'Feeling hopeless',
      'Isolating from others',
      'Loss of interest in activities',
    ],
    copingStrategies: [
      'Call a friend',
      'Go for a walk',
      'Practice mindfulness',
      'Listen to music',
    ],
    distractions: [
      'Watch favorite TV show',
      'Read a book',
      'Cook a meal',
      'Exercise',
    ],
    supportContacts: [
      { name: 'Best Friend', phone: '+254 7XX XXX XXX', relationship: 'Friend' },
      { name: 'Family Member', phone: '+254 7XX XXX XXX', relationship: 'Family' },
    ],
    professionalContacts: [
      {
        name: 'Dr. Amina Wanjiru',
        phone: '+254 7XX XXX XXX',
        role: 'Therapist',
      },
      {
        name: 'Kenya Red Cross',
        phone: '+254 722 178 177',
        role: 'Crisis Hotline',
      },
    ],
    reasonsToLive: [
      'My family needs me',
      'I want to see my dreams come true',
      'Things can get better',
      'I am loved',
    ],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl">
              👤
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {profile.displayName}
            </h1>
            <p className="text-gray-600">
              Member since {new Date(stats.memberSince).toLocaleDateString()}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.therapySessions}
                </div>
                <div className="text-sm text-gray-600">Sessions</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.journalEntries}
                </div>
                <div className="text-sm text-gray-600">Journal Entries</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.moodAverage}/10
                </div>
                <div className="text-sm text-gray-600">Avg Mood</div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <Card padding="lg" className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.isAnonymous && (
                <Alert type="info" title="Anonymous Mode Active">
                  Your identity is protected. Only your display name is visible to
                  others.
                </Alert>
              )}

              <div className="space-y-4 mt-4">
                <Input
                  label="Display Name"
                  value={profile.displayName}
                  disabled={!isEditing}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  disabled={!isEditing}
                />
                <Input
                  label="Phone Number"
                  value={profile.phoneNumber}
                  disabled={!isEditing}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Concerns
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.primaryConcerns.map((concern, index) => (
                      <Badge key={index} variant="info">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button variant="primary">Save Changes</Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Safety Plan */}
          <Card padding="lg" className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Safety Plan</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Your personalized crisis prevention plan
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowSafetyPlan(!showSafetyPlan)}
                >
                  {showSafetyPlan ? 'Hide' : 'View'}
                </Button>
              </div>
            </CardHeader>
            {showSafetyPlan && (
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      ⚠️ Warning Signs
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {safetyPlan.warningSigns.map((sign, index) => (
                        <li key={index}>{sign}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      🛠️ Coping Strategies
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {safetyPlan.copingStrategies.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      📞 Support Contacts
                    </h4>
                    <div className="space-y-2">
                      {safetyPlan.supportContacts.map((contact, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-600">
                              {contact.relationship}
                            </p>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-purple-600 font-medium"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      💙 Reasons to Live
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {safetyPlan.reasonsToLive.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <Button variant="primary" className="w-full">
                    Edit Safety Plan
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Settings */}
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Privacy & Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Anonymous Mode</h4>
                    <p className="text-sm text-gray-600">
                      Hide your identity in support groups
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.isAnonymous}
                    className="w-6 h-6 text-purple-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-600">
                      Receive session reminders and updates
                    </p>
                  </div>
                  <input type="checkbox" className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Data Sharing</h4>
                    <p className="text-sm text-gray-600">
                      Share anonymized data for mental health research
                    </p>
                  </div>
                  <input type="checkbox" className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
