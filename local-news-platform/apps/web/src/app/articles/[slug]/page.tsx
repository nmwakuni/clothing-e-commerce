import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, Badge, formatDate } from '@mtaa/ui';
import { MapPin, Clock, Eye, MessageCircle, Share2, Heart, Flag } from 'lucide-react';

// This would be fetched from API in production
const article = {
  id: '1',
  title: 'New Shopping Mall Opens in Westlands',
  summary: 'The Westlands Square Mall officially opened today with over 100 stores',
  content: `The much-anticipated Westlands Square Mall has officially opened its doors to the public today, bringing over 100 retail stores, restaurants, and entertainment options to the bustling Westlands neighborhood.

The four-story mall features international brands, a cinema complex, food court, and ample parking. Local residents gathered for the grand opening ceremony, which featured traditional dancers and performances.

"This is a game-changer for Westlands," said Mary Njoki, a local resident. "We now have everything we need right here in the neighborhood."

The mall is expected to create over 500 jobs and further cement Westlands' position as Nairobi's premier shopping destination.`,
  category: 'business',
  tags: ['shopping', 'mall', 'retail', 'westlands'],
  location: { name: 'Westlands', slug: 'westlands' },
  featuredImage: 'https://picsum.photos/1200/600?random=1',
  authorType: 'journalist',
  verificationStatus: 'verified',
  verificationScore: 95,
  viewsCount: 1250,
  commentsCount: 12,
  reactionsCount: 89,
  publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
};

const comments = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Peter Mwangi',
    content: 'Great news for Westlands! Looking forward to checking out the new stores.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    likesCount: 12,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sarah Njeri',
    content: 'Finally! We needed more shopping options in the area.',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    likesCount: 8,
  },
];

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
            <span>/</span>
            <Link href={`/locations/${article.location.slug}`} className="hover:text-primary-600">
              {article.location.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{article.category}</span>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="default">{article.category}</Badge>
              <Badge variant="success">
                ✓ Verified ({article.verificationScore}%)
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6">{article.summary}</p>

            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {article.location.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.viewsCount.toLocaleString()} views
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">{article.reactionsCount}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition">
                  <Flag className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="prose prose-lg max-w-none py-8">
              {article.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Comments Section */}
          <Card>
            <CardContent className="py-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  rows={3}
                  placeholder="Share your thoughts..."
                />
                <div className="mt-3 flex justify-end">
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{comment.userName}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                      <button className="text-sm text-gray-500 hover:text-primary-600">
                        Reply
                      </button>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    <button className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {comment.likesCount} likes
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
