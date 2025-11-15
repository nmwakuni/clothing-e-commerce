'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui';

interface Therapist {
  id: string;
  name: string;
  specializations: string[];
  bio: string;
  yearsOfExperience: number;
  languages: string[];
  sessionRate: number;
  rating: number;
  totalSessions: number;
  verified: boolean;
  acceptingClients: boolean;
}

const sampleTherapists: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Amina Wanjiru',
    specializations: ['Anxiety', 'Depression', 'Trauma'],
    bio: 'Licensed clinical psychologist with 10+ years of experience helping individuals navigate mental health challenges in African contexts.',
    yearsOfExperience: 10,
    languages: ['English', 'Swahili', 'Kikuyu'],
    sessionRate: 3000,
    rating: 4.9,
    totalSessions: 450,
    verified: true,
    acceptingClients: true,
  },
  {
    id: '2',
    name: 'Dr. James Omondi',
    specializations: ['Relationships', 'Family Therapy', 'Stress Management'],
    bio: 'Passionate about strengthening families and relationships through evidence-based therapeutic approaches.',
    yearsOfExperience: 8,
    languages: ['English', 'Swahili', 'Luo'],
    sessionRate: 2500,
    rating: 4.8,
    totalSessions: 320,
    verified: true,
    acceptingClients: true,
  },
  {
    id: '3',
    name: 'Dr. Grace Mutua',
    specializations: ['LGBTQ+ Issues', 'Identity', 'Depression'],
    bio: 'Creating safe, affirming spaces for LGBTQ+ individuals and anyone exploring identity and belonging.',
    yearsOfExperience: 6,
    languages: ['English', 'Swahili'],
    sessionRate: 2800,
    rating: 4.9,
    totalSessions: 280,
    verified: true,
    acceptingClients: true,
  },
  {
    id: '4',
    name: 'Dr. Daniel Kipchoge',
    specializations: ['Addiction', 'Behavioral Health', 'Crisis Intervention'],
    bio: 'Specialized in addiction recovery and crisis intervention with culturally-sensitive approaches.',
    yearsOfExperience: 12,
    languages: ['English', 'Swahili', 'Kalenjin'],
    sessionRate: 3500,
    rating: 4.7,
    totalSessions: 520,
    verified: true,
    acceptingClients: false,
  },
];

export default function TherapistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [maxRate, setMaxRate] = useState<number>(5000);

  const languages = ['all', 'English', 'Swahili', 'Kikuyu', 'Luo', 'Kalenjin'];

  const filteredTherapists = sampleTherapists.filter((therapist) => {
    const matchesSearch =
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLanguage =
      selectedLanguage === 'all' || therapist.languages.includes(selectedLanguage);
    const matchesRate = therapist.sessionRate <= maxRate;
    return matchesSearch && matchesLanguage && matchesRate;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find a Therapist 👨‍⚕️
          </h1>
          <p className="text-xl text-gray-600">
            Connect with verified mental health professionals
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Rate: KES {maxRate}
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={maxRate}
                onChange={(e) => setMaxRate(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Therapists Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} padding="lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl flex-shrink-0">
                  👨‍⚕️
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {therapist.name}
                      </h3>
                      <p className="text-gray-600">
                        {therapist.yearsOfExperience}+ years experience
                      </p>
                    </div>
                    {therapist.verified && (
                      <Badge variant="success">✓ Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold">{therapist.rating}</span>
                    <span className="text-gray-500">
                      ({therapist.totalSessions} sessions)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{therapist.bio}</p>

              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Specializations:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specializations.map((spec, index) => (
                      <Badge key={index} variant="info">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Languages:</h4>
                  <p className="text-gray-600">{therapist.languages.join(', ')}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-gray-600">Session Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      KES {therapist.sessionRate.toLocaleString()}
                    </p>
                  </div>
                  {therapist.acceptingClients ? (
                    <Button variant="primary" size="lg">
                      Book Appointment
                    </Button>
                  ) : (
                    <Badge variant="warning">Not Accepting Clients</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No therapists found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
