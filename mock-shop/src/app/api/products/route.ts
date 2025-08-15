import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy')

    // Build orderBy clause
    const orderBy = (() => {
      switch (sortBy) {
        case 'price-asc':
          return { price: 'asc' as const }
        case 'price-desc':
          return { price: 'desc' as const }
        case 'name-asc':
          return { name: 'asc' as const }
        case 'name-desc':
          return { name: 'desc' as const }
        default:
          return { createdAt: 'desc' as const }
      }
    })()

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice)
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: { 
        category: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      },
      orderBy
    })

    // Calculate average ratings
    const productsWithRatings = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }))

    return NextResponse.json({ products: productsWithRatings })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


