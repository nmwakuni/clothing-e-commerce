import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Sparkles, LayoutDashboard, UserSearch, MessagesSquare, CreditCard, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Mteja</span>
        </div>

        <nav className="space-y-1 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/profile-optimizer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <Sparkles className="h-5 w-5" />
            <span>Profile Optimizer</span>
            <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              FREE
            </span>
          </Link>

          <Link
            href="/dashboard/prospects"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <UserSearch className="h-5 w-5" />
            <span>Prospects</span>
          </Link>

          <Link
            href="/dashboard/outreach"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <MessagesSquare className="h-5 w-5" />
            <span>Outreach</span>
          </Link>

          <div className="my-4 border-t" />

          <Link
            href="/dashboard/billing"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <CreditCard className="h-5 w-5" />
            <span>Billing</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Welcome back!</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
