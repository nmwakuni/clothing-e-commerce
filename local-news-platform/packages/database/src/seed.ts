import { db } from './index';
import {
  users,
  userPreferences,
  locations,
  userLocationSubscriptions,
  articles,
  articleVerificationLogs,
  articleReactions,
  userSubmissions,
  businesses,
  businessReviews,
  sponsoredContent,
  events,
  classifieds,
  comments,
  polls,
  pollVotes,
  emergencyAlerts,
  lostAndFound,
  notifications,
} from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function seed() {
  console.log('🌱 Seeding database...');

  // Create locations (Nairobi neighborhoods)
  console.log('📍 Creating locations...');
  const [westlands, kilimani, karen, lavington, parklands] = await db
    .insert(locations)
    .values([
      {
        name: 'Westlands',
        slug: 'westlands',
        city: 'Nairobi',
        county: 'Nairobi County',
        latitude: -1.2676,
        longitude: 36.8108,
        locationType: 'estate',
        description: 'Upscale neighborhood known for shopping malls and entertainment',
        population: 45000,
      },
      {
        name: 'Kilimani',
        slug: 'kilimani',
        city: 'Nairobi',
        county: 'Nairobi County',
        latitude: -1.2921,
        longitude: 36.7847,
        locationType: 'estate',
        description: 'Residential area with many apartments and restaurants',
        population: 35000,
      },
      {
        name: 'Karen',
        slug: 'karen',
        city: 'Nairobi',
        county: 'Nairobi County',
        latitude: -1.3197,
        longitude: 36.7075,
        locationType: 'estate',
        description: 'Affluent suburb with large estates and green spaces',
        population: 25000,
      },
      {
        name: 'Lavington',
        slug: 'lavington',
        city: 'Nairobi',
        county: 'Nairobi County',
        latitude: -1.2833,
        longitude: 36.7667,
        locationType: 'estate',
        description: 'Quiet residential area with schools and local businesses',
        population: 30000,
      },
      {
        name: 'Parklands',
        slug: 'parklands',
        city: 'Nairobi',
        county: 'Nairobi County',
        latitude: -1.2571,
        longitude: 36.8273,
        locationType: 'estate',
        description: 'Diverse neighborhood with vibrant shopping and dining',
        population: 40000,
      },
    ])
    .returning();

  // Create users
  console.log('👥 Creating users...');
  const [adminUser, journalist1, journalist2, reader1, reader2, businessOwner] = await db
    .insert(users)
    .values([
      {
        email: 'admin@mtaanews.co.ke',
        phoneNumber: '+254700000001',
        name: 'Admin User',
        role: 'admin',
        preferredNeighborhood: westlands.slug,
      },
      {
        email: 'john.kamau@gmail.com',
        phoneNumber: '+254712345678',
        name: 'John Kamau',
        role: 'journalist',
        journalistVerified: true,
        reputationScore: 850,
        storiesSubmitted: 24,
        storiesApproved: 22,
        preferredNeighborhood: kilimani.slug,
      },
      {
        email: 'grace.wanjiru@gmail.com',
        phoneNumber: '+254723456789',
        name: 'Grace Wanjiru',
        role: 'journalist',
        journalistVerified: true,
        reputationScore: 720,
        storiesSubmitted: 18,
        storiesApproved: 16,
        preferredNeighborhood: westlands.slug,
      },
      {
        email: 'peter.mwangi@gmail.com',
        phoneNumber: '+254734567890',
        name: 'Peter Mwangi',
        role: 'reader',
        isPremium: true,
        preferredNeighborhood: karen.slug,
      },
      {
        email: 'sarah.njeri@gmail.com',
        phoneNumber: '+254745678901',
        name: 'Sarah Njeri',
        role: 'reader',
        preferredNeighborhood: parklands.slug,
      },
      {
        email: 'david.kimani@business.co.ke',
        phoneNumber: '+254756789012',
        name: 'David Kimani',
        role: 'business',
        preferredNeighborhood: lavington.slug,
      },
    ])
    .returning();

  // Create user preferences
  console.log('⚙️ Creating user preferences...');
  await db.insert(userPreferences).values([
    {
      userId: reader1.id,
      emailNotifications: true,
      whatsappNotifications: true,
      preferredLanguage: 'en',
      categoriesFollowed: ['community', 'business', 'events'],
      breakingNewsAlerts: true,
    },
    {
      userId: reader2.id,
      emailNotifications: false,
      whatsappNotifications: true,
      preferredLanguage: 'sw',
      categoriesFollowed: ['sports', 'entertainment'],
      dailyDigest: true,
    },
  ]);

  // Create location subscriptions
  console.log('📍 Creating location subscriptions...');
  await db.insert(userLocationSubscriptions).values([
    { userId: reader1.id, locationId: karen.id },
    { userId: reader1.id, locationId: westlands.id },
    { userId: reader2.id, locationId: parklands.id },
    { userId: journalist1.id, locationId: kilimani.id },
    { userId: journalist2.id, locationId: westlands.id },
  ]);

  // Create news articles
  console.log('📰 Creating news articles...');
  const [article1, article2, article3, article4, article5] = await db
    .insert(articles)
    .values([
      {
        title: 'New Shopping Mall Opens in Westlands',
        slug: 'new-shopping-mall-westlands',
        summary: 'The Westlands Square Mall officially opened today with over 100 stores',
        content: `The much-anticipated Westlands Square Mall has officially opened its doors to the public today, bringing over 100 retail stores, restaurants, and entertainment options to the bustling Westlands neighborhood.

The four-story mall features international brands, a cinema complex, food court, and ample parking. Local residents gathered for the grand opening ceremony, which featured traditional dancers and performances.

"This is a game-changer for Westlands," said Mary Njoki, a local resident. "We now have everything we need right here in the neighborhood."

The mall is expected to create over 500 jobs and further cement Westlands' position as Nairobi's premier shopping destination.`,
        authorId: journalist2.id,
        authorType: 'journalist',
        locationId: westlands.id,
        category: 'business',
        tags: ['shopping', 'mall', 'retail', 'westlands'],
        featuredImage: 'https://picsum.photos/800/600?random=1',
        verificationStatus: 'verified',
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        verificationScore: 95,
        sourceType: 'citizen_journalist',
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        viewsCount: 1250,
        sharesCount: 45,
        commentsCount: 12,
        reactionsCount: 89,
      },
      {
        title: 'Community Clean-Up Drive This Saturday in Kilimani',
        slug: 'community-cleanup-kilimani',
        summary: 'Join your neighbors for a neighborhood beautification initiative',
        content: `The Kilimani Residents Association is organizing a community clean-up drive this Saturday, March 16th, starting at 8:00 AM.

Volunteers will meet at the Kilimani Primary School grounds and will be provided with gloves, trash bags, and refreshments. The initiative aims to clean up local streets, parks, and common areas.

"We want to make Kilimani cleaner and greener," said John Kamau, the event organizer. "Everyone is welcome to participate, and we'll have activities for children too."

The event is part of a broader push to improve environmental consciousness in the neighborhood. Local businesses have donated supplies and refreshments for participants.`,
        authorId: journalist1.id,
        authorType: 'journalist',
        locationId: kilimani.id,
        category: 'community',
        tags: ['environment', 'community', 'volunteer', 'cleanup'],
        featuredImage: 'https://picsum.photos/800/600?random=2',
        verificationStatus: 'verified',
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        verificationScore: 98,
        sourceType: 'citizen_journalist',
        status: 'published',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        viewsCount: 780,
        sharesCount: 67,
        commentsCount: 8,
        reactionsCount: 124,
        isBreaking: true,
      },
      {
        title: 'Karen Road Closure for Water Main Repairs',
        slug: 'karen-road-closure-water-repairs',
        summary: 'Karen Road will be closed from Monday to Wednesday for emergency repairs',
        content: `Nairobi Water and Sewerage Company has announced that Karen Road will be temporarily closed from Monday, March 18th to Wednesday, March 20th for emergency water main repairs.

The closure will affect the section between Karen Shopping Centre and the Bogani Road junction. Traffic will be diverted through alternative routes.

Motorists are advised to use Dagoretti Road or Ngong Road as alternative routes. Local businesses have been notified in advance.

"We apologize for the inconvenience," said a spokesperson for the water company. "This is necessary maintenance to prevent a major water outage."`,
        authorId: null,
        authorType: 'ai',
        locationId: karen.id,
        category: 'breaking',
        tags: ['traffic', 'infrastructure', 'water', 'repairs'],
        featuredImage: 'https://picsum.photos/800/600?random=3',
        verificationStatus: 'verified',
        verificationScore: 92,
        sourceType: 'official',
        sourceUrl: 'https://nairobiwater.co.ke/announcements',
        sourceCredibilityScore: 95,
        status: 'published',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        viewsCount: 2340,
        sharesCount: 156,
        commentsCount: 23,
        reactionsCount: 234,
        isBreaking: true,
        isPinned: true,
      },
      {
        title: 'Local Football Tournament Finals This Sunday',
        slug: 'lavington-football-tournament-finals',
        summary: 'Lavington Youth League finals to be held at Lavington Sports Ground',
        content: `The Lavington Youth Football League will host its championship finals this Sunday, March 17th, at the Lavington Sports Ground.

Eight teams will compete across different age categories, with matches starting at 9:00 AM. Entry is free for spectators, and local food vendors will be on site.

"We've had an amazing season with over 200 young players participating," said tournament coordinator James Omondi. "The finals promise to be exciting matches."

The league has been running for five years and has become a cornerstone of youth sports in the neighborhood.`,
        authorId: journalist1.id,
        authorType: 'journalist',
        locationId: lavington.id,
        category: 'sports',
        tags: ['football', 'sports', 'youth', 'tournament'],
        featuredImage: 'https://picsum.photos/800/600?random=4',
        verificationStatus: 'verified',
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        verificationScore: 96,
        sourceType: 'citizen_journalist',
        status: 'published',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        viewsCount: 450,
        sharesCount: 34,
        commentsCount: 5,
        reactionsCount: 67,
      },
      {
        title: 'New Organic Farmers Market Opens in Parklands',
        slug: 'organic-market-parklands',
        summary: 'Fresh produce and artisanal goods every Saturday morning',
        content: `A new organic farmers market has opened in Parklands, offering fresh produce, artisanal breads, and handmade crafts every Saturday morning.

Located at the Parklands Community Center parking lot, the market runs from 7:00 AM to 1:00 PM. Over 20 local farmers and artisans participate, offering everything from vegetables to honey to handmade jewelry.

"We're bringing farm-fresh produce directly to Parklands residents," said market organizer Lucy Wambui. "Everything is organic and locally sourced."

The market has already attracted enthusiastic crowds and is expected to become a weekly tradition in the neighborhood.`,
        authorId: journalist2.id,
        authorType: 'journalist',
        locationId: parklands.id,
        category: 'community',
        tags: ['market', 'organic', 'food', 'community'],
        featuredImage: 'https://picsum.photos/800/600?random=5',
        verificationStatus: 'verified',
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        verificationScore: 94,
        sourceType: 'citizen_journalist',
        status: 'published',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        viewsCount: 890,
        sharesCount: 78,
        commentsCount: 15,
        reactionsCount: 145,
      },
    ])
    .returning();

  // Create businesses
  console.log('🏢 Creating businesses...');
  const [business1, business2, business3] = await db
    .insert(businesses)
    .values([
      {
        ownerId: businessOwner.id,
        locationId: westlands.id,
        name: "Java House Westlands",
        slug: 'java-house-westlands',
        description: 'Premium coffee shop and restaurant serving breakfast, lunch, and dinner',
        category: 'restaurant',
        phoneNumber: '+254701234567',
        email: 'westlands@javahouse.co.ke',
        website: 'https://javahouse.co.ke',
        address: 'Westlands Road, The Sarit Centre',
        latitude: -1.2676,
        longitude: 36.8108,
        logo: 'https://picsum.photos/200/200?random=10',
        coverImage: 'https://picsum.photos/800/400?random=11',
        subscriptionTier: 'premium',
        canPostSponsoredContent: true,
        canPostEvents: true,
        featuredListing: true,
        isVerified: true,
        status: 'active',
        viewsCount: 567,
        averageRating: 4.5,
        ratingsCount: 89,
      },
      {
        ownerId: businessOwner.id,
        locationId: kilimani.id,
        name: 'Kilimani Dental Clinic',
        slug: 'kilimani-dental-clinic',
        description: 'Professional dental services including cleanings, fillings, and cosmetic dentistry',
        category: 'health',
        phoneNumber: '+254702345678',
        email: 'info@kilimanidental.co.ke',
        whatsappNumber: '+254702345678',
        address: 'Kilimani Road, Yaya Centre',
        latitude: -1.2921,
        longitude: 36.7847,
        logo: 'https://picsum.photos/200/200?random=12',
        subscriptionTier: 'basic',
        canPostEvents: true,
        isVerified: true,
        status: 'active',
        viewsCount: 234,
        averageRating: 4.8,
        ratingsCount: 45,
      },
      {
        ownerId: businessOwner.id,
        locationId: parklands.id,
        name: 'Parklands Gym & Fitness',
        slug: 'parklands-gym-fitness',
        description: '24/7 gym with modern equipment, personal trainers, and group classes',
        category: 'services',
        phoneNumber: '+254703456789',
        email: 'info@parklandsgym.co.ke',
        website: 'https://parklandsgym.co.ke',
        address: '4th Parklands Avenue',
        latitude: -1.2571,
        longitude: 36.8273,
        logo: 'https://picsum.photos/200/200?random=13',
        coverImage: 'https://picsum.photos/800/400?random=14',
        subscriptionTier: 'premium',
        canPostSponsoredContent: true,
        canPostEvents: true,
        canPostClassifieds: true,
        featuredListing: true,
        isVerified: true,
        status: 'active',
        viewsCount: 789,
        averageRating: 4.7,
        ratingsCount: 123,
      },
    ])
    .returning();

  // Create comments
  console.log('💬 Creating comments...');
  await db.insert(comments).values([
    {
      articleId: article1.id,
      userId: reader1.id,
      content: 'Great news for Westlands! Looking forward to checking out the new stores.',
      likesCount: 12,
    },
    {
      articleId: article1.id,
      userId: reader2.id,
      content: 'Finally! We needed more shopping options in the area.',
      likesCount: 8,
    },
    {
      articleId: article2.id,
      userId: reader1.id,
      content: "I'll definitely be there on Saturday. Let's make our neighborhood beautiful!",
      likesCount: 15,
    },
  ]);

  // Create article reactions
  console.log('❤️ Creating article reactions...');
  await db.insert(articleReactions).values([
    { articleId: article1.id, userId: reader1.id, reactionType: 'like' },
    { articleId: article1.id, userId: reader2.id, reactionType: 'love' },
    { articleId: article2.id, userId: reader1.id, reactionType: 'important' },
    { articleId: article3.id, userId: reader2.id, reactionType: 'concerning' },
  ]);

  // Create events
  console.log('📅 Creating events...');
  await db.insert(events).values([
    {
      businessId: business3.id,
      locationId: parklands.id,
      title: 'Free Trial Week - All Classes',
      description: 'Try all our fitness classes free for one week! From yoga to HIIT, spinning to pilates.',
      category: 'health',
      venue: 'Parklands Gym & Fitness',
      address: '4th Parklands Avenue',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      image: 'https://picsum.photos/800/600?random=20',
      requiresRegistration: true,
      registrationUrl: 'https://parklandsgym.co.ke/trial',
      isFree: true,
    },
  ]);

  // Create a poll
  console.log('📊 Creating polls...');
  const [poll1] = await db
    .insert(polls)
    .values([
      {
        creatorId: adminUser.id,
        locationId: westlands.id,
        question: 'What improvement would you most like to see in Westlands?',
        description: 'Help us prioritize community projects',
        options: ['More green spaces', 'Better roads', 'More parking', 'Street lighting'],
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        totalVotes: 45,
      },
    ])
    .returning();

  // Create poll votes
  await db.insert(pollVotes).values([
    { pollId: poll1.id, userId: reader1.id, optionIndex: 0 },
    { pollId: poll1.id, userId: reader2.id, optionIndex: 1 },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Seed Summary:');
  console.log('  - 5 locations (Nairobi neighborhoods)');
  console.log('  - 6 users (admin, journalists, readers, business owner)');
  console.log('  - 5 news articles');
  console.log('  - 3 businesses');
  console.log('  - 3 comments');
  console.log('  - 1 event');
  console.log('  - 1 poll');
  console.log('\n✨ Ready to launch Mtaa News!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed!');
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
