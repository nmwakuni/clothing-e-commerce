import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Mteja</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Get More Clients from{' '}
            <span className="text-primary">LinkedIn</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            AI-powered profile optimization and personalized outreach for African professionals.
            Turn your LinkedIn profile into a client magnet.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free Profile Audit
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Free Profile Optimizer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Built for Africa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Pay in KES, NGN, UGX</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Everything You Need to Win on LinkedIn</h2>
          <p className="mt-4 text-gray-600">
            From profile optimization to personalized outreach at scale
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Profile Optimizer</h3>
            <p className="mt-2 text-gray-600">
              Get AI-powered feedback on your LinkedIn profile. Improve your headline, about section,
              and experience to attract more clients.
            </p>
            <div className="mt-4">
              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                FREE Forever
              </span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">AI Outreach Assistant</h3>
            <p className="mt-2 text-gray-600">
              Generate personalized LinkedIn messages and cold emails in seconds.
              Our AI researches prospects and writes messages that actually get responses.
            </p>
            <div className="mt-4">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                From KSh 2,900/mo
              </span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Simple CRM</h3>
            <p className="mt-2 text-gray-600">
              Track prospects, manage follow-ups, and analyze response rates.
              Know exactly what's working and what's not.
            </p>
            <div className="mt-4">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Included
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-primary px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to Get More Clients?</h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Start with a free profile audit. No credit card required.
          </p>
          <div className="mt-8">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2025 Mteja. Built for African professionals.</p>
        </div>
      </footer>
    </div>
  );
}
