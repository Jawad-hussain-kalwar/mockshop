"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { useCart } from "@/contexts/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"

interface WishlistItem {
  id: string
  createdAt: string
  product: {
    id: string
    name: string
    description: string | null
    price: number
    images: string
    stockQuantity: number
    category: {
      name: string
      slug: string
    } | null
  }
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { refreshCart } = useCart()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchWishlist()
  }, [session, status, router])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId))
      } else {
        alert('Failed to remove item from wishlist')
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      alert('Failed to remove item from wishlist')
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (response.ok) {
        alert('Added to cart!')
        // Ensure header cart count updates
        await refreshCart()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add to cart')
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading wishlist...</div>
        </main>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Account
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-4">
                Save items you love to your wishlist and shop them later.
              </p>
              <Link href="/products">
                <Button>
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const images = JSON.parse(item.product.images) as string[]
              const primaryImage = images[0] || '/images/placeholder.svg'
              
              return (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Link href={`/products/${item.product.id}`}>
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <Image
                          src={primaryImage}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {item.product.stockQuantity === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <Badge variant="destructive">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    {item.product.category && (
                      <Badge variant="secondary" className="mb-2">
                        {item.product.category.name}
                      </Badge>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">
                        ${item.product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.product.stockQuantity} in stock
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        disabled={item.product.stockQuantity === 0}
                        onClick={() => addToCart(item.product.id)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}