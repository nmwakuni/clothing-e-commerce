'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from '@mtaa/ui';
import { Camera, MapPin, AlertCircle } from 'lucide-react';

const categories = [
  'breaking',
  'crime',
  'politics',
  'business',
  'events',
  'community',
  'sports',
  'entertainment',
  'health',
  'education',
  'environment',
];

const locations = [
  { id: '1', name: 'Westlands' },
  { id: '2', name: 'Kilimani' },
  { id: '3', name: 'Karen' },
  { id: '4', name: 'Lavington' },
  { id: '5', name: 'Parklands' },
];

export default function SubmitPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'community',
    locationId: '',
    exactLocation: '',
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Story Submitted Successfully!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for contributing to your community. Your story is under review by our AI verification system and editorial team.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                <ol className="text-left text-gray-700 space-y-2">
                  <li>1. AI verification checks your story for accuracy and credibility</li>
                  <li>2. Our editorial team reviews the submission</li>
                  <li>3. If approved, your story will be published within 24 hours</li>
                  <li>4. You'll receive a notification when your story goes live</li>
                </ol>
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setSubmitted(false)}>Submit Another Story</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/')}>
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Submit Your Story</h1>
            <p className="text-lg text-gray-600">
              Be a citizen journalist. Share news and happenings from your neighborhood.
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Submission Guidelines</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ensure your story is factual and verifiable</li>
                <li>• Include specific details (when, where, who)</li>
                <li>• Add photos or videos if available</li>
                <li>• Stories undergo AI verification and editorial review</li>
                <li>• Approved stories are published within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>Story Details</CardTitle>
              <CardDescription>Fill in the details about the news event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Water shortage affects Kilimani residents"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[200px] focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about the event. Include who, what, when, where, and why..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.description.length} / 1000 characters
                  </p>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Neighborhood *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      value={formData.locationId}
                      onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                      required
                    >
                      <option value="">Select location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Exact Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Exact Location (Optional)
                  </label>
                  <Input
                    type="text"
                    value={formData.exactLocation}
                    onChange={(e) => setFormData({ ...formData, exactLocation: e.target.value })}
                    placeholder="e.g., Corner of Ngong Road and Valley Road"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="inline h-4 w-4 mr-1" />
                    Photos/Videos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition cursor-pointer">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB</p>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={() => (window.location.href = '/')}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!formData.title || !formData.description || !formData.locationId}
                  >
                    {submitting ? 'Submitting...' : 'Submit Story'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
