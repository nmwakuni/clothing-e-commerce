'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from '@mtaa/ui';
import { MessageCircle, Mail, Smartphone, CheckCircle } from 'lucide-react';

const locations = [
  { id: '1', name: 'Westlands' },
  { id: '2', name: 'Kilimani' },
  { id: '3', name: 'Karen' },
  { id: '4', name: 'Lavington' },
  { id: '5', name: 'Parklands' },
];

export default function SubscribePage() {
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<'whatsapp' | 'email' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    locations: [] as string[],
  });

  const handleLocationToggle = (locationId: string) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.includes(locationId)
        ? prev.locations.filter((id) => id !== locationId)
        : [...prev.locations, locationId],
    }));
  };

  const handleSubmit = () => {
    // Simulate subscription
    setStep(3);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              You're All Set! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Welcome to Mtaa News! You'll start receiving updates from your selected neighborhoods via{' '}
              {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">What to Expect:</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>✅ Breaking news alerts from your neighborhoods</li>
                <li>✅ Daily digest every morning at 7 AM</li>
                <li>✅ Community updates and event notifications</li>
                <li>✅ Emergency alerts when needed</li>
              </ul>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={() => (window.location.href = '/')}>
                Go to Homepage
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>
                Manage Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Subscribe to Mtaa News</h1>
          <p className="text-xl text-primary-100">
            Stay informed about what's happening in your neighborhood
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Step 1: Choose Channel */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">How would you like to receive news?</h2>
              <p className="text-center text-gray-600 mb-8">Choose your preferred channel</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className={`cursor-pointer transition ${
                    channel === 'whatsapp'
                      ? 'ring-2 ring-primary-600 shadow-lg'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setChannel('whatsapp')}
                >
                  <CardContent className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <MessageCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
                    <p className="text-gray-600 mb-4">
                      Instant updates delivered right to your phone
                    </p>
                    <Badge variant="success">Most Popular</Badge>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition ${
                    channel === 'email' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setChannel('email')}
                >
                  <CardContent className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Email</h3>
                    <p className="text-gray-600 mb-4">
                      Daily digest delivered to your inbox
                    </p>
                    <Badge variant="secondary">Classic</Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={() => setStep(2)} disabled={!channel}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>Tell us about yourself and choose your neighborhoods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Contact */}
                {channel === 'whatsapp' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Smartphone className="inline h-4 w-4 mr-1" />
                      Phone Number (WhatsApp) *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+254 700 000 000"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                )}

                {/* Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Neighborhoods *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => handleLocationToggle(location.id)}
                        className={`p-4 rounded-lg border-2 transition text-left ${
                          formData.locations.includes(location.id)
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{location.name}</span>
                          {formData.locations.includes(location.id) && (
                            <CheckCircle className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.name || (!formData.phone && !formData.email) || formData.locations.length === 0}
                  >
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
