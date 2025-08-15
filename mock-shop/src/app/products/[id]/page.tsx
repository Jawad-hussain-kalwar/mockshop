import { notFound } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Heart, Share2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { ProductReviews } from "@/components/reviews/product-reviews"
import { ProductActions } from "@/components/product/product-actions"

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        },
        where: {
          isApproved: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  return product
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const images = JSON.parse(product.images) as string[]
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image
                src={images[0] || '/images/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-md">
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="secondary" className="mb-2">
                  {product.category.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
                {product.stockQuantity > 0 ? (
                  <Badge variant="outline" className="text-green-600">
                    {product.stockQuantity} in stock
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Out of stock
                  </Badge>
                )}
              </div>

              {product.reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= averageRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            <ProductActions 
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                stockQuantity: product.stockQuantity,
                images: product.images
              }}
            />

            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
          <ProductReviews productId={product.id} />
        </div>
      </main>
    </div>
  )
}