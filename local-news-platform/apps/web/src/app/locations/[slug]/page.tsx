import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge, formatDate } from '@mtaa/ui';
import { MapPin, Users, TrendingUp, Clock, MessageCircle, Heart } from 'lucide-react';

// Mock data - would come from API
const location = {
  name: 'Westlands',
  slug: 'westlands',
  city: 'Nairobi',
  description: 'Upscale neighborhood known for shopping malls and entertainment',
  activeUsers: 1250,
  articlesCount: 24,
  image: 'https://picsum.photos/1200/400?random=10',
};

const articles = [
  {
    id: '1',
    title: 'New Shopping Mall Opens in Westlands',
    summary: 'The Westlands Square Mall officially opened today with over 100 stores',
    slug: 'new-shopping-mall-westlands',
    category: 'business',
    featuredImage: 'https://picsum.photos/400/300?random=2',
    viewsCount: 1250,
    commentsCount: 12,
    reactionsCount: 89,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Community Clean-Up Drive This Saturday',
    summary: 'Join your neighbors for a neighborhood beautification initiative',
    slug: 'community-cleanup-westlands',
    category: 'community',
    featuredImage: 'https://picsum.photos/400/300?random=3',
    viewsCount: 780,
    commentsCount: 8,
    reactionsCount: 124,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const trendingTopics = ['Shopping', 'Traffic', 'Events', 'Security', 'Business'];

export default function LocationDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero */}
      <div className="relative h-64">
        <Image src={location.image} alt={location.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <Badge variant="secondary" className="mb-2">
              {location.city}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{location.name}</h1>
            <p className="text-lg text-gray-200">{location.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Latest from {location.name}</h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>Most Recent</option>
                <option>Most Popular</option>
                <option>Most Commented</option>
              </select>
            </div>

            <div className="space-y-6">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition">
                  <div className="md:flex">
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover rounded-l-lg"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <Badge variant="default" className="mb-2">
                        {article.category}
                      </Badge>
                      <Link href={`/articles/${article.slug}`}>
                        <h3 className="text-xl font-bold hover:text-primary-600 transition mb-2">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4">{article.summary}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {article.reactionsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {article.commentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Location Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Total Articles
                  </span>
                  <span className="font-bold text-lg">{location.articlesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Active Users
                  </span>
                  <span className="font-bold text-lg">{location.activeUsers}</span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      #{topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscribe */}
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <CardHeader>
                <CardTitle>Get {location.name} News</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Subscribe to receive updates from {location.name} directly on WhatsApp
                </p>
                <Link
                  href="/subscribe"
                  className="block w-full bg-primary-600 text-white text-center px-4 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Subscribe Now
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
