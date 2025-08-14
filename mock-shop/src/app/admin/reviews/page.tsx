"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Star,
  Check,
  X,
  Trash2,
  MessageSquare
} from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string | null
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  product: {
    id: string
    name: string
    images: string
  }
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchReviews()
  }, [session, status, router, statusFilter])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      const response = await fetch(`/api/admin/reviews?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const moderateReview = async (reviewId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      })

      if (response.ok) {
        setReviews(prev => 
          prev.map(review => 
            review.id === reviewId ? { ...review, isApproved } : review
          )
        )
        alert(`Review ${isApproved ? 'approved' : 'rejected'} successfully`)
      } else {
        alert('Failed to moderate review')
      }
    } catch (error) {
      console.error('Failed to moderate review:', error)
      alert('Failed to moderate review')
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        alert('Review deleted successfully')
      } else {
        alert('Failed to delete review')
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Failed to delete review')
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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading reviews...</div>
        </main>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Review Management</h1>
              <p className="text-gray-600">Moderate customer reviews and ratings</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reviews found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => {
              const images = JSON.parse(review.product.images) as string[]
              const primaryImage = images[0] || '/images/placeholder.svg'
              
              return (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={primaryImage}
                          alt={review.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      
                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {renderStars(review.rating)}
                              <Badge variant={review.isApproved ? "default" : "secondary"}>
                                {review.isApproved ? 'Approved' : 'Pending'}
                              </Badge>
                            </div>
                            <h3 className="font-semibold">{review.product.name}</h3>
                            <p className="text-sm text-gray-600">
                              By {review.user.firstName} {review.user.lastName} ({review.user.email})
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!review.isApproved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moderateReview(review.id, true)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {review.isApproved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moderateReview(review.id, false)}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteReview(review.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Review Comment */}
                        {review.comment && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}