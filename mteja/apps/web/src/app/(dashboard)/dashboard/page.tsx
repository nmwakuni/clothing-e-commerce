import { ArrowRight, Sparkles, UserSearch, MessagesSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profile Score</p>
              <p className="text-3xl font-bold">85/100</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">+12 from last audit</p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prospects</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <UserSearch className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">8 contacted this week</p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Messages Sent</p>
              <p className="text-3xl font-bold">42</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <MessagesSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">15 this week</p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold">32%</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">+5% from last month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Optimize Your Profile</h3>
              <p className="mt-1 text-sm text-gray-600">
                Get AI-powered feedback to improve your LinkedIn profile and attract more clients.
              </p>
              <Link href="/dashboard/profile-optimizer">
                <Button className="mt-4 gap-2">
                  Start Audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <UserSearch className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Research New Prospects</h3>
              <p className="mt-1 text-sm text-gray-600">
                Add LinkedIn profiles and let AI research them to create personalized outreach.
              </p>
              <Link href="/dashboard/prospects">
                <Button className="mt-4 gap-2" variant="outline">
                  Add Prospect
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-white">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Profile audit completed</p>
                <p className="mt-1 text-sm text-gray-600">
                  Your profile score improved from 73 to 85
                </p>
              </div>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">New prospect added</p>
                <p className="mt-1 text-sm text-gray-600">
                  John Kamau from TechHub Africa
                </p>
              </div>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Message sent</p>
                <p className="mt-1 text-sm text-gray-600">
                  Connection request sent to Sarah Omondi
                </p>
              </div>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
