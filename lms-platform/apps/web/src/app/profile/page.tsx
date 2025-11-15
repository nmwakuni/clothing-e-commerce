'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, Progress, Input } from '@lms/ui';
import { Mail, Phone, Calendar, Award, BookOpen, Clock, TrendingUp, Edit2, Save, X } from 'lucide-react';
import { authAPI, isAuthenticated } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await authAPI.getMe();
      setUser(data.user);
      setFormData({
        fullName: data.user.fullName || '',
        email: data.user.email || '',
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      if ((error as any)?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // TODO: Implement update API endpoint
    console.log('Saving profile:', formData);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar Card */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Avatar
                    size="2xl"
                    fallback={user.fullName || user.phoneNumber}
                    src={user.profilePictureUrl}
                    className="mx-auto mb-4"
                  />
                  <h2 className="text-xl font-bold mb-1">{user.fullName || 'Student'}</h2>
                  <p className="text-gray-600 text-sm mb-4">{user.phoneNumber}</p>

                  <Badge variant="default" className="mb-2">
                    {user.subscriptionTier === 'premium' ? '⭐ Premium' : user.subscriptionTier === 'free' ? 'Free' : user.subscriptionTier}
                  </Badge>

                  <div className="mt-6 pt-6 border-t space-y-4">
                    {/* Level Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Level {user.level || 1}</span>
                        <span className="text-sm text-gray-600">{user.xpPoints || 0} XP</span>
                      </div>
                      <Progress value={((user.xpPoints || 0) % 1000) / 10} showLabel={false} />
                      <p className="text-xs text-gray-500 mt-1">
                        {1000 - ((user.xpPoints || 0) % 1000)} XP to Level {(user.level || 1) + 1}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{user.streakDays || 0}</div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{user.level || 1}</div>
                        <div className="text-xs text-gray-600">Level</div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-6">
                    Change Avatar
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Joined</p>
                      <p className="font-medium">{joinedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Role</p>
                      <p className="font-medium capitalize">{user.role || 'student'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Editable Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    {!editing ? (
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {editing ? (
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900">{user.fullName || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {editing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900">{user.email || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900">{user.phoneNumber}</p>
                      <Badge variant="success" className="text-xs">Verified</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number cannot be changed for security reasons
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Learning Goal
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>30 minutes per day</option>
                      <option>1 hour per day</option>
                      <option>2 hours per day</option>
                      <option>Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Learning Time
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Morning (6AM - 12PM)</option>
                      <option>Afternoon (12PM - 6PM)</option>
                      <option>Evening (6PM - 12AM)</option>
                      <option>Night (12AM - 6AM)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="font-medium">WhatsApp Notifications</p>
                      <p className="text-sm text-gray-600">Receive learning reminders via WhatsApp</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive course updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-gray-600">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
