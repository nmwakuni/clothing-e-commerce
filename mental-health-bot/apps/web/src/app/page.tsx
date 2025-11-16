import Link from 'next/link';
import { Heart, MessageCircle, BarChart3, Shield, Users, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-purple-600">Nafsi</span> 💜
        </h1>
        <p className="text-2xl text-gray-600 mb-4">Your soul, your wellness</p>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
          AI-powered mental health support designed for African communities.
          Accessible, confidential, and available 24/7 via WhatsApp or web.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            Start Talking 💬
          </Link>
          <Link
            href="/whatsapp"
            className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-lg flex items-center gap-2"
          >
            <Phone className="h-5 w-5" />
            Chat on WhatsApp
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How Nafsi Supports You</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: MessageCircle,
              title: '24/7 AI Counselor',
              description: 'Talk to an AI therapist anytime, trained on African mental health context',
              color: 'purple',
            },
            {
              icon: Shield,
              title: 'Crisis Detection',
              description: 'Immediate help and resources when you need them most',
              color: 'red',
            },
            {
              icon: BarChart3,
              title: 'Mood Tracking',
              description: 'Track your emotions and see patterns over time',
              color: 'blue',
            },
            {
              icon: Users,
              title: 'Support Groups',
              description: 'Connect anonymously with others facing similar challenges',
              color: 'green',
            },
            {
              icon: Heart,
              title: 'Self-Care Tools',
              description: 'Guided meditation, breathing exercises, journaling',
              color: 'pink',
            },
            {
              icon: Phone,
              title: 'Professional Help',
              description: 'Find licensed therapists in your area',
              color: 'indigo',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
              <div className={`inline-flex p-4 bg-${feature.color}-100 rounded-full mb-4`}>
                <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">You don't have to face this alone</h2>
          <p className="text-xl mb-8 opacity-90">
            Free support available right now. Start your journey to better mental health.
          </p>
          <Link
            href="/signup"
            className="bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition inline-block shadow-lg"
          >
            Get Started - It's Free
          </Link>
          <p className="mt-6 text-sm opacity-75">100% confidential • No email required • Anonymous option available</p>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="bg-red-50 border-l-4 border-red-600 p-6 my-8 container mx-auto">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-900 mb-2">🆘 Need Immediate Help?</h3>
            <p className="text-red-800 mb-4">
              If you're in crisis or having thoughts of harming yourself, please reach out right now:
            </p>
            <div className="space-y-2 text-red-900 font-semibold">
              <div>📞 Kenya Red Cross: <a href="tel:+254722178177" className="underline">+254 722 178 177</a></div>
              <div>📞 Safaricom Crisis Line: <a href="tel:1199" className="underline">1199</a></div>
              <div>🚨 Emergency Services: <a href="tel:999" className="underline">999</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
