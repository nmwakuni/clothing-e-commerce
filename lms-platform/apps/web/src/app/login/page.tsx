'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Alert } from '@lms/ui';
import { Smartphone, Send, CheckCircle2, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 0) return '';
    if (cleaned.startsWith('254')) {
      // Format: +254 712 345 678
      const match = cleaned.match(/^(\d{3})(\d{0,3})(\d{0,3})(\d{0,3})$/);
      if (match) {
        return `+${match[1]}${match[2] ? ' ' + match[2] : ''}${match[3] ? ' ' + match[3] : ''}${match[4] ? ' ' + match[4] : ''}`.trim();
      }
    } else if (cleaned.startsWith('0')) {
      // Format: 0712 345 678
      const match = cleaned.match(/^(\d{4})(\d{0,3})(\d{0,3})$/);
      if (match) {
        return `${match[1]}${match[2] ? ' ' + match[2] : ''}${match[3] ? ' ' + match[3] : ''}`.trim();
      }
    }
    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');

    // Check Kenya formats
    if (cleaned.startsWith('254')) {
      // +254 format - should be 12 digits (254 + 9 digits)
      return /^254[71]\d{8}$/.test(cleaned);
    } else if (cleaned.startsWith('0')) {
      // 0 format - should be 10 digits
      return /^0[71]\d{8}$/.test(cleaned);
    }

    return false;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const handleSendLink = async () => {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Call auth API to send magic link
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send login link');
      }

      setLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = () => {
    setLinkSent(false);
    setPhoneNumber('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-green-600 mb-2">SkillHub Africa</h1>
          </Link>
          <p className="text-gray-600">Learn anything, anytime via WhatsApp 📱</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-green-600" />
              {linkSent ? 'Check Your Phone' : 'Login with Phone Number'}
            </CardTitle>
            <CardDescription>
              {linkSent
                ? 'We sent you a login link via WhatsApp'
                : 'Enter your phone number to receive a login link'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!linkSent ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712 345 678"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send a login link to this number via WhatsApp
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <p className="text-sm">{error}</p>
                  </Alert>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSendLink}
                  disabled={!phoneNumber || loading}
                  loading={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Login Link
                    </>
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">How it works</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <p>Enter your phone number above</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <p>We'll send you a login link via WhatsApp</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <p>Click the link to login instantly - no password needed!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Login Link Sent!</h3>
                  <p className="text-gray-700 mb-4">
                    Check WhatsApp on <span className="font-bold">{phoneNumber}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Click the link in the message to login. The link expires in 15 minutes.
                  </p>
                </div>

                <Alert>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Didn't receive the link?</h4>
                    <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                      <li>Check your WhatsApp messages</li>
                      <li>Make sure you entered the correct number</li>
                      <li>Wait a few moments - it may take up to 1 minute</li>
                      <li>Check your internet connection</li>
                    </ul>
                  </div>
                </Alert>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={handleResendLink}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Try Different Number
                  </Button>

                  <Button variant="ghost" onClick={handleSendLink} disabled={loading}>
                    Resend Login Link
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span className="font-medium text-green-600">
                  No worries! We'll create one for you automatically.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-green-600 inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
          <div>
            <p className="font-bold text-2xl text-green-600">3,421</p>
            <p>Students</p>
          </div>
          <div>
            <p className="font-bold text-2xl text-green-600">100+</p>
            <p>Courses</p>
          </div>
          <div>
            <p className="font-bold text-2xl text-green-600">4.8★</p>
            <p>Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}
