import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileOptimizerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile Optimizer</h1>
        <p className="mt-2 text-gray-600">
          Get AI-powered feedback on your LinkedIn profile to attract more clients
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-lg border bg-white p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-2 text-sm text-gray-500">
              We'll analyze your public profile information
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Industry (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Software Development, Marketing, Finance"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Role (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Freelance Developer, Agency Owner, Consultant"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button className="w-full gap-2" size="lg">
            <Sparkles className="h-5 w-5" />
            Analyze My Profile
          </Button>
        </div>
      </div>

      {/* Free Forever Badge */}
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <p className="text-sm font-medium text-green-800">
          ✨ Profile optimization is FREE forever - no credit card required
        </p>
      </div>
    </div>
  );
}
