"use client"

import { useState } from "react"
import { ReviewForm } from "./review-form"
import { ReviewList } from "./review-list"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      <ReviewForm 
        productId={productId} 
        onReviewSubmitted={handleReviewSubmitted}
      />
      <ReviewList 
        productId={productId} 
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
}