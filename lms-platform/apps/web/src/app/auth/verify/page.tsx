'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, Alert } from '@lms/ui';
import { Loader, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type VerificationState = 'verifying' | 'success' | 'error' | 'expired';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('verifying');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setState('error');
      setError('No verification token provided');
      return;
    }

    verifyToken(token);
  }, [token]);

  useEffect(() => {
    if (state === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (state === 'success' && countdown === 0) {
      router.push('/dashboard');
    }
  }, [state, countdown, router]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();

        if (response.status === 410 || data.error?.includes('expired')) {
          setState('expired');
          setError('This login link has expired. Login links are valid for 15 minutes.');
        } else {
          setState('error');
          setError(data.error || 'Failed to verify login link');
        }
        return;
      }

      const data = await response.json();

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setState('success');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
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
          <CardContent className="p-8">
            {state === 'verifying' && (
              <div className="text-center space-y-4">
                <Loader className="h-16 w-16 text-green-600 mx-auto animate-spin" />
                <h2 className="text-2xl font-bold">Verifying...</h2>
                <p className="text-gray-600">Please wait while we log you in</p>
              </div>
            )}

            {state === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600">Login Successful! 🎉</h2>
                <p className="text-gray-600">
                  Welcome to SkillHub Africa! Redirecting you to your dashboard...
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Redirecting in <span className="font-bold text-green-600">{countdown}</span>{' '}
                    seconds...
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  Go to Dashboard Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {state === 'expired' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="h-10 w-10 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-orange-600">Link Expired</h2>
                <Alert variant="warning">
                  <p className="text-sm">{error}</p>
                </Alert>

                <div className="pt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Request New Login Link
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="text-sm text-gray-600">
                  Login links expire after 15 minutes for security reasons.
                </p>
              </div>
            )}

            {state === 'error' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
                <Alert variant="destructive">
                  <p className="text-sm">{error || 'Unable to verify your login link'}</p>
                </Alert>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">This could happen if:</p>
                  <ul className="text-sm text-gray-600 space-y-1 text-left list-disc list-inside">
                    <li>The link has already been used</li>
                    <li>The link has expired (15 minute limit)</li>
                    <li>The link was copied incorrectly</li>
                    <li>There's a network connectivity issue</li>
                  </ul>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Request New Login Link
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link href="/" className="text-gray-600 hover:text-green-600 text-sm">
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        {(state === 'expired' || state === 'error') && (
          <div className="mt-6 text-center">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Need help?</span> Contact us via WhatsApp at{' '}
                  <a href="https://wa.me/254712345678" className="text-green-600 hover:underline">
                    +254 712 345 678
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
