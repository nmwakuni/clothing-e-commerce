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
  Button,
  Badge,
  Input,
  Alert,
} from '@lms/ui';
import { Bell, Lock, CreditCard, Globe, Shield, Smartphone, Mail, Zap } from 'lucide-react';
import { isAuthenticated } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, []);

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-green-50 text-green-600 font-medium'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Notifications */}
              {activeTab === 'notifications' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Choose how you want to receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* WhatsApp Notifications */}
                      <div>
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-green-600" />
                          WhatsApp Notifications
                        </h3>
                        <div className="space-y-4 ml-7">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Daily Learning Reminder</p>
                              <p className="text-sm text-gray-600">
                                Get reminded to learn every day
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Streak Reminders</p>
                              <p className="text-sm text-gray-600">Don't lose your streak!</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">New Course Releases</p>
                              <p className="text-sm text-gray-600">
                                Be first to know about new courses
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Email Notifications */}
                      <div className="pt-6 border-t">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <Mail className="h-5 w-5 text-blue-600" />
                          Email Notifications
                        </h3>
                        <div className="space-y-4 ml-7">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Weekly Progress Report</p>
                              <p className="text-sm text-gray-600">
                                Summary of your learning progress
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Marketing Emails</p>
                              <p className="text-sm text-gray-600">Tips, offers, and promotions</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Privacy & Security */}
              {activeTab === 'privacy' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy & Security</CardTitle>
                      <CardDescription>Manage your privacy and security settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-bold mb-4">Profile Visibility</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Public Profile</p>
                              <p className="text-sm text-gray-600">
                                Make your profile visible to others
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Show Learning Activity</p>
                              <p className="text-sm text-gray-600">
                                Display your course progress publicly
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <h3 className="font-bold mb-4">Data & Privacy</h3>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            Download My Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Delete My Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            View Privacy Policy
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <div>
                          <p className="font-bold text-sm">Your data is safe</p>
                          <p className="text-xs mt-1">
                            We use industry-standard encryption to protect your data. We never share
                            your personal information with third parties.
                          </p>
                        </div>
                      </Alert>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Billing */}
              {activeTab === 'billing' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription & Billing</CardTitle>
                      <CardDescription>
                        Manage your subscription and payment methods
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg">Current Plan: Free</h3>
                            <p className="text-sm text-gray-600">Limited access to courses</p>
                          </div>
                          <Badge variant="outline">Free</Badge>
                        </div>
                        <Button className="w-full">
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade to Premium - KES 500/month
                        </Button>
                      </div>

                      <div>
                        <h3 className="font-bold mb-4">Premium Benefits</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Unlimited access to all courses</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Unlimited AI tutor questions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Download courses for offline learning</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Priority support</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Blockchain-verified certificates</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-6 border-t">
                        <h3 className="font-bold mb-4">Payment History</h3>
                        <p className="text-sm text-gray-600">No payment history available</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>App Preferences</CardTitle>
                      <CardDescription>Customize your learning experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select className="w-full px-3 py-2 border rounded-lg">
                          <option>English</option>
                          <option>Swahili</option>
                          <option>French</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Zone
                        </label>
                        <select className="w-full px-3 py-2 border rounded-lg">
                          <option>East Africa Time (EAT) - UTC+3</option>
                          <option>West Africa Time (WAT) - UTC+1</option>
                          <option>South Africa Time (SAST) - UTC+2</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <button className="border-2 border-green-600 rounded-lg p-4 text-center">
                            <div className="w-full h-20 bg-white border rounded mb-2"></div>
                            <p className="text-sm font-medium">Light</p>
                          </button>
                          <button className="border-2 border-gray-200 rounded-lg p-4 text-center">
                            <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                            <p className="text-sm font-medium">Dark</p>
                          </button>
                          <button className="border-2 border-gray-200 rounded-lg p-4 text-center">
                            <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 rounded mb-2"></div>
                            <p className="text-sm font-medium">Auto</p>
                          </button>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <Button className="w-full">Save Preferences</Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
