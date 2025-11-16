'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Alert,
  Badge,
} from '@lms/ui';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader,
  ArrowLeft,
  Shield,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

// Mock data (replace with API)
const courseData = {
  id: '1',
  title: 'Web Development Fundamentals',
  price: 2500,
  originalPrice: 5000,
  thumbnail: 'https://placehold.co/400x300/22c55e/white?text=Web+Dev',
};

type PaymentMethod = 'mpesa' | 'card';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (paymentStatus === 'processing' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (paymentStatus === 'processing' && countdown === 0) {
      // Timeout - check status
      checkPaymentStatus();
    }
  }, [paymentStatus, countdown]);

  const formatPhoneDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.startsWith('254')) {
      const match = cleaned.match(/^(\d{3})(\d{0,3})(\d{0,3})(\d{0,3})$/);
      if (match) {
        return `+${match[1]}${match[2] ? ' ' + match[2] : ''}${match[3] ? ' ' + match[3] : ''}${match[4] ? ' ' + match[4] : ''}`.trim();
      }
    } else if (cleaned.startsWith('0')) {
      const match = cleaned.match(/^(\d{4})(\d{0,3})(\d{0,3})$/);
      if (match) {
        return `${match[1]}${match[2] ? ' ' + match[2] : ''}${match[3] ? ' ' + match[3] : ''}`.trim();
      }
    }
    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('254')) {
      return /^254[71]\d{8}$/.test(cleaned);
    } else if (cleaned.startsWith('0')) {
      return /^0[71]\d{8}$/.test(cleaned);
    }

    return false;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const handlePayNow = async () => {
    if (paymentMethod === 'mpesa') {
      if (!validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid M-Pesa phone number (e.g., 0712345678)');
        return;
      }

      setPaymentStatus('processing');
      setError('');
      setCountdown(60);

      try {
        // Initiate STK Push
        const response = await fetch('/api/payments/mpesa/stk-push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            phoneNumber,
            amount: courseData.price,
            accountReference: courseId,
            transactionDesc: `Course: ${courseData.title}`,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to initiate payment');
        }

        const data = await response.json();
        setCheckoutRequestId(data.CheckoutRequestID);

        // Start polling for payment status
        pollPaymentStatus(data.CheckoutRequestID);
      } catch (err) {
        setPaymentStatus('failed');
        setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      }
    } else {
      // Card payment (future implementation)
      setError('Card payments coming soon! Please use M-Pesa.');
    }
  };

  const pollPaymentStatus = async (checkoutId: string) => {
    const maxAttempts = 12; // Poll for 60 seconds (12 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setPaymentStatus('failed');
        setError('Payment timeout. Please try again or contact support.');
        return;
      }

      try {
        const response = await fetch(`/api/payments/mpesa/status?checkoutRequestId=${checkoutId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();

        if (data.status === 'completed') {
          setPaymentStatus('success');
          setTransactionId(data.mpesaReceiptNumber);
        } else if (data.status === 'failed') {
          setPaymentStatus('failed');
          setError(data.error || 'Payment was cancelled or failed');
        } else {
          // Still pending, poll again
          attempts++;
          setTimeout(poll, 5000);
        }
      } catch (err) {
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const checkPaymentStatus = async () => {
    if (!checkoutRequestId) return;

    try {
      const response = await fetch(
        `/api/payments/mpesa/status?checkoutRequestId=${checkoutRequestId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();

      if (data.status === 'completed') {
        setPaymentStatus('success');
        setTransactionId(data.mpesaReceiptNumber);
      } else {
        setPaymentStatus('failed');
        setError('Payment timeout. Please contact support if money was deducted.');
      }
    } catch (err) {
      setPaymentStatus('failed');
      setError('Failed to verify payment. Please contact support.');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold text-green-600">Payment Successful! 🎉</h2>

              <p className="text-gray-600">
                You've successfully enrolled in{' '}
                <span className="font-bold">{courseData.title}</span>
              </p>

              <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold">{formatPrice(courseData.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>M-Pesa</span>
                </div>
              </div>

              <Alert variant="success">
                <div>
                  <p className="font-bold text-sm">Receipt sent!</p>
                  <p className="text-xs mt-1">Check your phone for M-Pesa confirmation message.</p>
                </div>
              </Alert>

              <div className="pt-4 space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => router.push(`/courses/${courseId}/lessons/1`)}
                >
                  Start Learning Now
                </Button>

                <Link
                  href="/dashboard"
                  className="block text-center text-sm text-gray-600 hover:text-green-600"
                >
                  Go to Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-colors ${
                    paymentMethod === 'mpesa'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">M-Pesa</p>
                    <p className="text-sm text-gray-600">Pay with M-Pesa (Instant)</p>
                  </div>
                  {paymentMethod === 'mpesa' && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  disabled
                  className="w-full p-4 border-2 border-gray-200 rounded-lg flex items-center gap-4 opacity-50 cursor-not-allowed"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">Credit / Debit Card</p>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* M-Pesa Payment Details */}
            {paymentMethod === 'mpesa' && paymentStatus === 'idle' && (
              <Card>
                <CardHeader>
                  <CardTitle>M-Pesa Details</CardTitle>
                  <CardDescription>
                    Enter your M-Pesa number to receive payment prompt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712 345 678"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      You'll receive a payment prompt on this number
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <p className="text-sm">{error}</p>
                    </Alert>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-sm mb-2">How it works:</h4>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Enter your M-Pesa number above</li>
                      <li>Click "Pay Now" button</li>
                      <li>Check your phone for M-Pesa prompt</li>
                      <li>Enter your M-Pesa PIN to complete payment</li>
                    </ol>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayNow}
                    disabled={!phoneNumber}
                  >
                    Pay {formatPrice(courseData.price)} via M-Pesa
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Processing State */}
            {paymentStatus === 'processing' && (
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <Loader className="h-16 w-16 text-green-600 mx-auto animate-spin" />

                  <h3 className="text-2xl font-bold">Waiting for Payment...</h3>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                    <Smartphone className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <p className="font-bold text-lg mb-2">Check your phone! 📱</p>
                    <p className="text-gray-700">
                      Enter your M-Pesa PIN on the prompt sent to{' '}
                      <span className="font-bold">{phoneNumber}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Time remaining: {countdown}s</span>
                  </div>

                  <Alert>
                    <div>
                      <p className="text-sm font-medium">Didn't receive prompt?</p>
                      <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                        <li>Check if your phone is on</li>
                        <li>Make sure you have network connection</li>
                        <li>Dial *234# to check M-Pesa menu</li>
                      </ul>
                    </div>
                  </Alert>

                  <Button variant="outline" onClick={() => setPaymentStatus('idle')}>
                    Cancel Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Failed State */}
            {paymentStatus === 'failed' && (
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <X className="h-10 w-10 text-red-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-red-600">Payment Failed</h3>

                  <Alert variant="destructive">
                    <p className="text-sm">{error}</p>
                  </Alert>

                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => setPaymentStatus('idle')}>
                      Try Again
                    </Button>

                    <p className="text-sm text-gray-600">
                      Need help?{' '}
                      <a
                        href="https://wa.me/254712345678"
                        className="text-green-600 hover:underline"
                      >
                        Contact Support on WhatsApp
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={courseData.thumbnail}
                  alt={courseData.title}
                  className="w-full h-32 object-cover rounded-lg"
                />

                <div>
                  <h3 className="font-bold">{courseData.title}</h3>
                  <Badge variant="success" className="mt-2">
                    50% Off - Limited Time!
                  </Badge>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="line-through text-gray-500">
                      {formatPrice(courseData.originalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">
                      -{formatPrice(courseData.originalPrice - courseData.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(courseData.price)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Lifetime access to course</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Learn via WhatsApp</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing icon component
function X(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
