import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import { Star } from 'lucide-react';

const ReviewsList = ({ farmerId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [farmerId]);

  const fetchReviews = async () => {
    try {
      const [reviewsResponse, statsResponse] = await Promise.all([
        reviewsAPI.getFarmerReviews(farmerId),
        reviewsAPI.getStats(farmerId)
      ]);

      setReviews(reviewsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card p-6">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {stats.average.toFixed(1)}
            </div>
            <div className="flex items-center justify-center space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(stats.average)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.count} review{stats.count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 max-w-xs">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = stats.count > 0 ? (stats.distribution[rating] / stats.count) * 100 : 0;
              return (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="w-8 text-gray-600 dark:text-gray-400">{rating} star</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-600 dark:text-gray-400 text-right">
                    {stats.distribution[rating]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={review.consumer.avatar || '/default-avatar.png'}
                    alt={review.consumer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {review.consumer.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {review.product && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Product: {review.product.name}
                </p>
              )}
              
              <p className="text-gray-700 dark:text-gray-300 mt-3">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;