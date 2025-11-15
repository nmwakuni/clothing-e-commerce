'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Avatar, Badge, Progress, Input } from '@lms/ui';
import { Star, ThumbsUp, MessageCircle, Filter, CheckCircle } from 'lucide-react';
import { isAuthenticated, getCurrentUser } from '@/lib/api';

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface CourseReviewsProps {
  courseId: string;
  averageRating: number;
  totalReviews: number;
  enrolled?: boolean;
}

export function CourseReviews({ courseId, averageRating, totalReviews, enrolled = false }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      user: { name: 'John Kamau' },
      rating: 5,
      comment: 'Amazing course! Sarah explains everything so clearly. I went from zero coding knowledge to building my own websites in just 3 weeks. The WhatsApp support is brilliant!',
      date: '2024-01-15',
      helpful: 24,
      verified: true,
    },
    {
      id: '2',
      user: { name: 'Grace Wanjiku' },
      rating: 5,
      comment: 'The WhatsApp integration is brilliant. I could learn during my commute on the matatu. Best investment I made this year! The AI tutor is super helpful.',
      date: '2024-01-10',
      helpful: 18,
      verified: true,
    },
    {
      id: '3',
      user: { name: 'David Omondi' },
      rating: 4,
      comment: 'Great content and practical exercises. The M-Pesa payment was super smooth. I wish there were more advanced topics covered, but overall highly recommend!',
      date: '2024-01-05',
      helpful: 12,
      verified: true,
    },
    {
      id: '4',
      user: { name: 'Mary Chebet' },
      rating: 5,
      comment: 'Perfect for beginners! The examples using Kenyan context (like building an M-Pesa calculator) made it so much easier to understand. Thank you!',
      date: '2024-01-02',
      helpful: 9,
      verified: true,
    },
  ]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
  }));

  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      alert('Please login to leave a review');
      return;
    }

    if (newRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!newComment.trim()) {
      alert('Please write a comment');
      return;
    }

    const user = getCurrentUser();

    // TODO: Call API to submit review
    const review: Review = {
      id: Date.now().toString(),
      user: {
        name: user?.fullName || user?.phoneNumber || 'Anonymous',
      },
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: enrolled,
    };

    setReviews([review, ...reviews]);
    setNewRating(0);
    setNewComment('');
    setShowReviewForm(false);
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      return b.helpful - a.helpful;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Student Reviews</CardTitle>
          <CardDescription>
            See what other students think about this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">{totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors ${
                    filterRating === rating ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} showLabel={false} className="flex-1" />
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {enrolled && !showReviewForm && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={() => setShowReviewForm(true)} className="w-full md:w-auto">
                Write a Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
            <CardDescription>Share your experience with this course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= newRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What did you think of this course?"
                className="w-full px-3 py-2 border rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmitReview}>Submit Review</Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {filterRating ? `Showing ${filterRating}-star reviews` : `All reviews (${reviews.length})`}
          </span>
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-green-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
          className="px-3 py-1 border rounded-lg text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar size="md" fallback={review.user.name} src={review.user.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold">{review.user.name}</h4>
                    {review.verified && (
                      <Badge variant="success" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{review.comment}</p>

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedReviews.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">No reviews match your filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
