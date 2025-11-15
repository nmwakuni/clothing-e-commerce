'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@mtaa/ui';
import { FileText, Users, Building2, AlertCircle, TrendingUp, Eye } from 'lucide-react';

const stats = [
  {
    label: 'Total Articles',
    value: '248',
    change: '+12%',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    label: 'Active Users',
    value: '4,832',
    change: '+23%',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    label: 'Businesses',
    value: '156',
    change: '+8%',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    label: 'Pending Review',
    value: '12',
    change: '-5%',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-300 mt-1">Manage content and users</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge variant={stat.change.startsWith('+') ? 'success' : 'danger'}>
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['overview', 'submissions', 'articles', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium capitalize transition ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'submissions' && <SubmissionsTab />}
        {activeTab === 'articles' && <ArticlesTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'New article published',
                title: 'Karen Road Closure',
                time: '5 minutes ago',
              },
              {
                action: 'User submitted story',
                title: 'Traffic accident in Westlands',
                time: '15 minutes ago',
              },
              {
                action: 'Business listing approved',
                title: 'Java House Westlands',
                time: '1 hour ago',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.action}</div>
                  <div className="text-sm text-gray-600">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'New Shopping Mall Opens', views: 1250, location: 'Westlands' },
              { title: 'Karen Road Closure', views: 2340, location: 'Karen' },
              { title: 'Community Clean-Up', views: 780, location: 'Kilimani' },
            ].map((article, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{article.title}</div>
                  <Badge variant="secondary" className="text-xs">
                    {article.location}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye className="h-4 w-4" />
                  {article.views}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmissionsTab() {
  const submissions = [
    {
      id: '1',
      title: 'Water shortage in Kilimani',
      author: 'John Kamau',
      location: 'Kilimani',
      status: 'pending',
      aiScore: 87,
      submittedAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'New restaurant opening',
      author: 'Grace Wanjiru',
      location: 'Westlands',
      status: 'under_review',
      aiScore: 92,
      submittedAt: '5 hours ago',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {submission.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>By {submission.author}</span>
                    <span>•</span>
                    <span>{submission.location}</span>
                    <span>•</span>
                    <span>{submission.submittedAt}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      submission.status === 'pending'
                        ? 'warning'
                        : submission.status === 'under_review'
                        ? 'secondary'
                        : 'success'
                    }
                  >
                    {submission.status.replace('_', ' ')}
                  </Badge>
                  <div className="text-sm">
                    AI Score: <span className="font-semibold">{submission.aiScore}%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                  Approve
                </button>
                <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
                  Reject
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ArticlesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Published Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Views</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  title: 'New Shopping Mall Opens',
                  location: 'Westlands',
                  views: 1250,
                  status: 'published',
                },
                {
                  title: 'Karen Road Closure',
                  location: 'Karen',
                  views: 2340,
                  status: 'published',
                },
              ].map((article, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-900">{article.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{article.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{article.views}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">{article.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-primary-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'John Kamau',
                  email: 'john.kamau@gmail.com',
                  role: 'journalist',
                  joined: '2 months ago',
                },
                {
                  name: 'Peter Mwangi',
                  email: 'peter.mwangi@gmail.com',
                  role: 'reader',
                  joined: '3 weeks ago',
                },
              ].map((user, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'journalist' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.joined}</td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-primary-600 hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
