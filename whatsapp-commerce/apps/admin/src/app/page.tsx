'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats] = useState({
    totalVendors: 1247,
    pendingApproval: 34,
    totalCustomers: 15678,
    totalRevenue: 12450000,
    platformFees: 248900,
    activeOrders: 456,
    completedOrders: 8934,
  });

  const [revenueData] = useState([
    { month: 'Jan', revenue: 850000, fees: 17000 },
    { month: 'Feb', revenue: 920000, fees: 18400 },
    { month: 'Mar', revenue: 1150000, fees: 23000 },
    { month: 'Apr', revenue: 980000, fees: 19600 },
    { month: 'May', revenue: 1340000, fees: 26800 },
    { month: 'Jun', revenue: 1210000, fees: 24200 },
  ]);

  const [pendingVendors] = useState([
    { id: '1', name: 'Tech World KE', owner: 'David Mwangi', category: 'Electronics', submitted: '2025-01-15' },
    { id: '2', name: 'Organic Farms', owner: 'Sarah Kamau', category: 'Produce', submitted: '2025-01-15' },
    { id: '3', name: 'Fashion Hub', owner: 'Grace Njeri', category: 'Fashion', submitted: '2025-01-14' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🛍️ Biashara Admin Portal</h1>
              <p className="text-blue-100 text-sm">Platform Management Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Admin: John Doe</span>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Vendors</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalVendors.toLocaleString()}</p>
                <p className="text-sm text-orange-600 font-semibold">
                  {stats.pendingApproval} pending approval
                </p>
              </div>
              <div className="text-4xl">🏪</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Customers</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Platform Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  KES {(stats.platformFees / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500">from {stats.completedOrders.toLocaleString()} orders</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Orders</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.activeOrders}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Revenue (6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="fees" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" />
                <Bar dataKey="fees" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Vendor Approvals ({stats.pendingApproval})
            </h2>
          </div>
          <div className="divide-y">
            {pendingVendors.map((vendor) => (
              <div key={vendor.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{vendor.name}</p>
                  <p className="text-sm text-gray-600">Owner: {vendor.owner}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {vendor.category}
                    </span>
                    <span className="text-xs text-gray-500">Submitted: {vendor.submitted}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                    ✓ Approve
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                    ✗ Reject
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-2">Vendor Management</h3>
            <p className="text-sm mb-4 opacity-90">Review and approve vendors</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 w-full">
              Manage Vendors
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-2">Order Monitoring</h3>
            <p className="text-sm mb-4 opacity-90">Track platform orders</p>
            <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 w-full">
              View Orders
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-2">Platform Settings</h3>
            <p className="text-sm mb-4 opacity-90">Configure fees and limits</p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 w-full">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
