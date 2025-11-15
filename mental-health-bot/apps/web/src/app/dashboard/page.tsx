'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, MessageCircle, Heart, Brain } from 'lucide-react';

// Mock data - would come from API
const moodData = [
  { date: '11/08', mood: 7, energy: 6 },
  { date: '11/09', mood: 6, energy: 7 },
  { date: '11/10', mood: 8, energy: 8 },
  { date: '11/11', mood: 5, energy: 5 },
  { date: '11/12', mood: 7, energy: 6 },
  { date: '11/13', mood: 9, energy: 8 },
  { date: '11/14', mood: 8, energy: 7 },
];

export default function DashboardPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const moodEmojis = ['😢', '😞', '😐', '😊', '😄'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Mental Wellness Dashboard</h1>
          <p className="text-gray-600">Track your journey to better mental health</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Current Streak', value: '7 days', icon: Calendar, color: 'purple' },
            { label: 'Therapy Sessions', value: '12', icon: MessageCircle, color: 'blue' },
            { label: 'Mood Average', value: '7.2/10', icon: Heart, color: 'pink' },
            { label: 'Insights', value: '23', icon: Brain, color: 'indigo' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className={`inline-flex p-3 bg-${stat.color}-100 rounded-lg mb-3`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mood Chart */}
        <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            Your Mood Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#9333ea" strokeWidth={3} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={3} name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Mood Log */}
        <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {moodEmojis.map((emoji, i) => {
              const moodValue = (i + 1) * 2;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedMood(moodValue)}
                  className={`p-6 rounded-xl text-6xl transition ${
                    selectedMood === moodValue
                      ? 'bg-purple-100 ring-4 ring-purple-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          {selectedMood && (
            <div className="mt-6 text-center">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                Log Mood ({selectedMood}/10)
              </button>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Recent Therapy Sessions</h2>
          <div className="space-y-4">
            {[
              { date: 'Nov 14', duration: '35 min', sentiment: 'Positive', topics: ['Work stress', 'Coping'] },
              { date: 'Nov 12', duration: '28 min', sentiment: 'Neutral', topics: ['Family', 'Boundaries'] },
              { date: 'Nov 10', duration: '42 min', sentiment: 'Positive', topics: ['Self-care', 'Goals'] },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{session.date}</div>
                    <div className="text-sm text-gray-600">{session.duration} • {session.sentiment}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {session.topics.map((topic, j) => (
                    <span key={j} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
