'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VendorDashboard() {
  const [stats] = useState({
    totalRevenue: 145000,
    totalOrders: 87,
    pendingOrders: 12,
    totalProducts: 24,
    averageRating: 4.7,
    totalReviews: 156,
  });

  const [recentOrders] = useState([
    { id: 'ORD-001', customer: 'Jane Doe', items: 2, total: 2500, status: 'pending', date: '2025-01-16' },
    { id: 'ORD-002', customer: 'John Smith', items: 1, total: 14500, status: 'confirmed', date: '2025-01-16' },
    { id: 'ORD-003', customer: 'Mary Johnson', items: 3, total: 1800, status: 'delivered', date: '2025-01-15' },
  ]);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">🛍️ Biashara</h1>
              <span className="ml-4 text-gray-600">Vendor Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">
                🔔 Notifications
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                👤 Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  KES {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-sm text-orange-600 font-semibold">
                  {stats.pendingOrders} pending
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Products Listed</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
              </div>
              <div className="text-4xl">🏷️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-600">⭐ {stats.averageRating}</p>
                <p className="text-sm text-gray-600">{stats.totalReviews} reviews</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Subscription</p>
                <p className="text-lg font-bold text-indigo-600">Pro Plan</p>
                <p className="text-sm text-gray-600">Expires: Mar 2025</p>
              </div>
              <div className="text-4xl">👑</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Quick Actions</p>
                <div className="mt-2 space-y-1">
                  <Link href="/products/new" className="text-sm text-blue-600 hover:underline block">
                    + Add Product
                  </Link>
                  <Link href="/orders" className="text-sm text-blue-600 hover:underline block">
                    View Orders
                  </Link>
                </div>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <Link href="/orders" className="text-blue-600 hover:underline text-sm">
                  View All
                </Link>
              </div>
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          KES {order.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{order.items} items</p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Store</h3>
              <div className="space-y-3">
                <Link
                  href="/products"
                  className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                >
                  📦 Products
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium"
                >
                  🛒 Orders
                </Link>
                <Link
                  href="/analytics"
                  className="block px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium"
                >
                  📊 Analytics
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                >
                  ⚙️ Settings
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-bold mb-2">🚀 Upgrade to Pro</h3>
              <p className="text-sm mb-4 opacity-90">
                Unlock unlimited products, advanced analytics, and priority support
              </p>
              <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 w-full">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
