'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Avatar, Badge } from '@lms/ui';
import { Menu, X, Search, Bell, BookOpen, User, LogOut, Settings, Award } from 'lucide-react';
import { isAuthenticated, getCurrentUser, logout } from '@/lib/api';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-600">
            <BookOpen className="h-6 w-6" />
            SkillHub Africa
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/courses"
              className={`text-sm font-medium transition-colors ${
                isActivePath('/courses') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Courses
            </Link>
            {isAuth && (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActivePath('/dashboard')
                      ? 'text-green-600'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  My Learning
                </Link>
              </>
            )}
            <Link
              href="/#pricing"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {isAuth ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Avatar
                      size="sm"
                      fallback={user?.fullName || user?.phoneNumber}
                      src={user?.profilePictureUrl}
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium">{user?.fullName || 'Student'}</p>
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">Level {user?.level || 1}</span>
                      </div>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20 py-2">
                        <div className="px-4 py-3 border-b">
                          <p className="font-medium">{user?.fullName || 'Student'}</p>
                          <p className="text-sm text-gray-600">{user?.phoneNumber}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="success" className="text-xs">
                              {user?.subscriptionTier || 'Free'}
                            </Badge>
                            <span className="text-xs text-gray-600">{user?.xpPoints || 0} XP</span>
                          </div>
                        </div>

                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span className="text-sm">My Courses</span>
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span className="text-sm">Profile</span>
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span className="text-sm">Settings</span>
                        </Link>

                        <hr className="my-2" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/login">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            <Link
              href="/courses"
              className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>

            {isAuth && (
              <Link
                href="/dashboard"
                className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Learning
              </Link>
            )}

            <Link
              href="/#pricing"
              className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>

            <hr />

            {isAuth ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <Avatar
                    size="md"
                    fallback={user?.fullName || user?.phoneNumber}
                    src={user?.profilePictureUrl}
                  />
                  <div>
                    <p className="font-medium">{user?.fullName || 'Student'}</p>
                    <p className="text-sm text-gray-600">{user?.phoneNumber}</p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
