"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
}

interface ReviewListProps {
  productId: string
  refreshTrigger?: number
}

interface ReviewData {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [productId, currentPage, refreshTrigger])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/product/${productId}?page=${currentPage}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setReviewData(data)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!reviewData || reviewData.totalReviews === 0) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewData.ratingDistribution[rating as keyof typeof reviewData.ratingDistribution]
          const percentage = reviewData.totalReviews > 0 ? (count / reviewData.totalReviews) * 100 : 0
          
          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">Loading reviews...</div>
      </div>
    )
  }

  if (!reviewData) {
    return (
      <div className="text-center text-gray-600">
        Failed to load reviews
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {reviewData.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(reviewData.averageRating))}
              </div>
              <p className="text-gray-600">
                Based on {reviewData.totalReviews} review{reviewData.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviewData.reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewData.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <Badge variant="secondary">{review.rating}/5</Badge>
                    </div>
                    <p className="font-medium">
                      {review.user.firstName} {review.user.lastName}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {reviewData.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {reviewData.pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === reviewData.pagination.pages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}