import React, { useState } from 'react';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, Send } from 'lucide-react';

const ReviewSection = ({ farmerId, productId, orderId, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await reviewsAPI.create({
        farmerId,
        productId,
        orderId,
        rating,
        comment: comment.trim()
      });

      setRating(0);
      setComment('');
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      <form onSubmit={handleSubmitReview} className="space-y-4">
        {/* Star Rating */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!rating || !comment.trim() || isSubmitting}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
        </button>
      </form>
    </div>
  );
};

export default ReviewSection;