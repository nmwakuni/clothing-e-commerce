import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge, formatDate } from '@mtaa/ui';
import { MapPin, TrendingUp, Clock, MessageCircle, Heart } from 'lucide-react';

// This would come from API in production
const breakingNews = {
  title: 'Karen Road Closure for Water Main Repairs',
  summary: 'Karen Road will be closed from Monday to Wednesday for emergency repairs',
  slug: 'karen-road-closure-water-repairs',
  location: 'Karen',
  publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  imageUrl: 'https://picsum.photos/800/400?random=1',
};

const articles = [
  {
    id: '1',
    title: 'New Shopping Mall Opens in Westlands',
    summary: 'The Westlands Square Mall officially opened today with over 100 stores',
    slug: 'new-shopping-mall-westlands',
    location: 'Westlands',
    category: 'business',
    featuredImage: 'https://picsum.photos/400/300?random=2',
    viewsCount: 1250,
    commentsCount: 12,
    reactionsCount: 89,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Community Clean-Up Drive This Saturday in Kilimani',
    summary: 'Join your neighbors for a neighborhood beautification initiative',
    slug: 'community-cleanup-kilimani',
    location: 'Kilimani',
    category: 'community',
    featuredImage: 'https://picsum.photos/400/300?random=3',
    viewsCount: 780,
    commentsCount: 8,
    reactionsCount: 124,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Local Football Tournament Finals This Sunday',
    summary: 'Lavington Youth League finals to be held at Lavington Sports Ground',
    slug: 'lavington-football-tournament-finals',
    location: 'Lavington',
    category: 'sports',
    featuredImage: 'https://picsum.photos/400/300?random=4',
    viewsCount: 450,
    commentsCount: 5,
    reactionsCount: 67,
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'New Organic Farmers Market Opens in Parklands',
    summary: 'Fresh produce and artisanal goods every Saturday morning',
    slug: 'organic-market-parklands',
    location: 'Parklands',
    category: 'community',
    featuredImage: 'https://picsum.photos/400/300?random=5',
    viewsCount: 890,
    commentsCount: 15,
    reactionsCount: 145,
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

const locations = [
  { name: 'Westlands', slug: 'westlands', articlesCount: 24, activeUsers: 1250 },
  { name: 'Kilimani', slug: 'kilimani', articlesCount: 18, activeUsers: 980 },
  { name: 'Karen', slug: 'karen', articlesCount: 15, activeUsers: 760 },
  { name: 'Parklands', slug: 'parklands', articlesCount: 21, activeUsers: 1100 },
  { name: 'Lavington', slug: 'lavington', articlesCount: 12, activeUsers: 650 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Neighborhood, Your News</h1>
          <p className="text-xl text-primary-100 mb-6">
            Hyperlocal news, verified by AI, powered by your community
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              Submit a Story
            </Link>
            <Link
              href="/locations"
              className="bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
            >
              Browse Locations
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Breaking News */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-center gap-2 text-red-600 text-sm font-semibold mb-2">
                  <TrendingUp className="h-4 w-4" />
                  BREAKING NEWS
                </div>
                <Link href={`/articles/${breakingNews.slug}`}>
                  <CardTitle className="hover:text-primary-600 transition">
                    {breakingNews.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={breakingNews.imageUrl}
                    alt={breakingNews.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-gray-600 mb-4">{breakingNews.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {breakingNews.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(breakingNews.publishedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Latest News */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Latest News</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition">
                    <div className="relative h-48">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90">
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <Link href={`/articles/${article.slug}`}>
                        <CardTitle className="text-lg hover:text-primary-600 transition line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.summary}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {article.location}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {article.reactionsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {article.commentsCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Popular Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {locations.map((location) => (
                  <Link
                    key={location.slug}
                    href={`/locations/${location.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{location.name}</div>
                      <div className="text-sm text-gray-500">
                        {location.articlesCount} articles
                      </div>
                    </div>
                    <Badge variant="secondary">{location.activeUsers}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* WhatsApp Subscribe */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-xl">Get News via WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Subscribe to receive daily news updates directly on WhatsApp
                </p>
                <Link
                  href="/subscribe"
                  className="block w-full bg-green-600 text-white text-center px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
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
