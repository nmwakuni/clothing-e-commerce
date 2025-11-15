import Image from 'next/image';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@mtaa/ui';
import { MapPin, Calendar, Clock, Users, Ticket } from 'lucide-react';

const events = [
  {
    id: '1',
    title: 'Free Trial Week - All Fitness Classes',
    description: 'Try all our fitness classes free for one week! From yoga to HIIT, spinning to pilates.',
    location: 'Parklands',
    venue: 'Parklands Gym & Fitness',
    address: '4th Parklands Avenue',
    category: 'health',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    image: 'https://picsum.photos/800/400?random=30',
    isFree: true,
    maxAttendees: 100,
    currentAttendees: 45,
  },
  {
    id: '2',
    title: 'Westlands Farmers Market',
    description: 'Weekly farmers market featuring fresh organic produce, artisanal goods, and local crafts.',
    location: 'Westlands',
    venue: 'Sarit Centre Parking',
    address: 'Westlands Road',
    category: 'community',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    image: 'https://picsum.photos/800/400?random=31',
    isFree: true,
  },
  {
    id: '3',
    title: 'Tech Startup Networking Night',
    description: 'Connect with entrepreneurs, investors, and tech enthusiasts. Pitch your ideas!',
    location: 'Kilimani',
    venue: 'The Hub Karen',
    address: 'Karen Road',
    category: 'business',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    image: 'https://picsum.photos/800/400?random=32',
    isFree: false,
    ticketPrice: 1000,
    maxAttendees: 50,
    currentAttendees: 32,
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Local Events</h1>
          <p className="text-xl text-primary-100">
            Discover what's happening in your neighborhood
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-xl transition">
              <div className="relative h-56">
                <Image src={event.image} alt={event.title} fill className="object-cover rounded-t-lg" />
                <div className="absolute top-4 right-4">
                  {event.isFree ? (
                    <Badge variant="success" className="text-lg">
                      FREE
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-lg">
                      KES {event.ticketPrice}
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{event.category}</Badge>
                  <span className="text-sm text-gray-500">{event.location}</span>
                </div>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{event.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {event.startDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4" />
                    <span>
                      {event.startDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue}, {event.address}</span>
                  </div>
                  {event.maxAttendees && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.currentAttendees}/{event.maxAttendees} attending
                      </span>
                    </div>
                  )}
                </div>

                <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
                  {event.isFree ? 'RSVP Free' : 'Get Tickets'}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
