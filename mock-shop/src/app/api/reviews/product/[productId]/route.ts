import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/reviews/product/[productId] - Get reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [reviews, totalCount, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          isApproved: true
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: {
          productId,
          isApproved: true
        }
      }),
      prisma.review.aggregate({
        where: {
          productId,
          isApproved: true
        },
        _avg: {
          rating: true
        }
      })
    ])

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        isApproved: true
      },
      _count: {
        rating: true
      }
    })

    const distribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }

    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      averageRating: averageRating._avg.rating || 0,
      totalReviews: totalCount,
      ratingDistribution: distribution
    })
  } catch (error) {
    console.error("Product reviews fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}