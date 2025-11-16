import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@mtaa/ui';
import { MapPin, Star, Phone, Mail, Globe, Clock } from 'lucide-react';

const businesses = [
  {
    id: '1',
    name: 'Java House Westlands',
    slug: 'java-house-westlands',
    category: 'restaurant',
    description: 'Premium coffee shop and restaurant serving breakfast, lunch, and dinner',
    location: 'Westlands',
    address: 'The Sarit Centre, Westlands Road',
    phone: '+254701234567',
    website: 'https://javahouse.co.ke',
    rating: 4.5,
    reviewsCount: 89,
    logo: 'https://picsum.photos/200/200?random=20',
    coverImage: 'https://picsum.photos/800/400?random=21',
    isPremium: true,
  },
  {
    id: '2',
    name: 'Kilimani Dental Clinic',
    slug: 'kilimani-dental-clinic',
    category: 'health',
    description: 'Professional dental services including cleanings, fillings, and cosmetic dentistry',
    location: 'Kilimani',
    address: 'Yaya Centre, Kilimani Road',
    phone: '+254702345678',
    rating: 4.8,
    reviewsCount: 45,
    logo: 'https://picsum.photos/200/200?random=22',
    coverImage: 'https://picsum.photos/800/400?random=23',
    isPremium: false,
  },
  {
    id: '3',
    name: 'Parklands Gym & Fitness',
    slug: 'parklands-gym-fitness',
    category: 'services',
    description: '24/7 gym with modern equipment, personal trainers, and group classes',
    location: 'Parklands',
    address: '4th Parklands Avenue',
    phone: '+254703456789',
    website: 'https://parklandsgym.co.ke',
    rating: 4.7,
    reviewsCount: 123,
    logo: 'https://picsum.photos/200/200?random=24',
    coverImage: 'https://picsum.photos/800/400?random=25',
    isPremium: true,
  },
];

const categories = [
  'All',
  'Restaurant',
  'Retail',
  'Services',
  'Health',
  'Education',
  'Entertainment',
];

export default function BusinessesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Local Businesses</h1>
          <p className="text-xl text-primary-100">
            Discover and support businesses in your neighborhood
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <Button key={cat} variant={cat === 'All' ? 'default' : 'outline'} size="sm">
              {cat}
            </Button>
          ))}
        </div>

        {/* Business Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {businesses.map((business) => (
            <Link key={business.id} href={`/businesses/${business.slug}`}>
              <Card className="hover:shadow-xl transition cursor-pointer h-full">
                <div className="relative h-48">
                  <Image
                    src={business.coverImage}
                    alt={business.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  {business.isPremium && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="warning" className="bg-yellow-500 text-white">
                        ⭐ Featured
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={business.logo}
                        alt={business.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl hover:text-primary-600 transition">
                        {business.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{business.rating}</span>
                          <span className="text-sm text-gray-500">
                            ({business.reviewsCount})
                          </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <Badge variant="secondary">{business.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{business.description}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{business.address}</span>
                    </div>
                    {business.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="text-primary-600 hover:underline">
                          Visit Website
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">List Your Business</h2>
            <p className="text-xl text-primary-100 mb-6">
              Reach thousands of local customers in your neighborhood
            </p>
            <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
