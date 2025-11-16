import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@mtaa/ui';
import { MapPin, TrendingUp, Users } from 'lucide-react';

const locations = [
  {
    id: '1',
    name: 'Westlands',
    slug: 'westlands',
    city: 'Nairobi',
    description: 'Upscale neighborhood known for shopping malls and entertainment',
    articlesCount: 24,
    activeUsers: 1250,
    image: 'https://picsum.photos/400/300?random=10',
  },
  {
    id: '2',
    name: 'Kilimani',
    slug: 'kilimani',
    city: 'Nairobi',
    description: 'Residential area with many apartments and restaurants',
    articlesCount: 18,
    activeUsers: 980,
    image: 'https://picsum.photos/400/300?random=11',
  },
  {
    id: '3',
    name: 'Karen',
    slug: 'karen',
    city: 'Nairobi',
    description: 'Affluent suburb with large estates and green spaces',
    articlesCount: 15,
    activeUsers: 760,
    image: 'https://picsum.photos/400/300?random=12',
  },
  {
    id: '4',
    name: 'Lavington',
    slug: 'lavington',
    city: 'Nairobi',
    description: 'Quiet residential area with schools and local businesses',
    articlesCount: 12,
    activeUsers: 650,
    image: 'https://picsum.photos/400/300?random=13',
  },
  {
    id: '5',
    name: 'Parklands',
    slug: 'parklands',
    city: 'Nairobi',
    description: 'Diverse neighborhood with vibrant shopping and dining',
    articlesCount: 21,
    activeUsers: 1100,
    image: 'https://picsum.photos/400/300?random=14',
  },
];

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Browse Locations</h1>
          <p className="text-xl text-primary-100">
            Discover news from neighborhoods across Nairobi
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Link key={location.id} href={`/locations/${location.slug}`}>
              <Card className="h-full hover:shadow-xl transition cursor-pointer">
                <div
                  className="h-48 bg-cover bg-center rounded-t-lg"
                  style={{ backgroundImage: `url(${location.image})` }}
                />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{location.city}</Badge>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </span>
                  </div>
                  <CardTitle className="text-xl hover:text-primary-600 transition">
                    {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{location.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {location.articlesCount} articles
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      {location.activeUsers} users
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
