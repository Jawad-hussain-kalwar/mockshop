"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCart } from "@/contexts/cart-context"

interface Product {
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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const images = JSON.parse(product.images) as string[]
  const primaryImage = images[0] || '/images/placeholder.svg'

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    
    try {
      await addItem(product.id, 1)
      alert('Added to cart!')
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!session?.user) {
      alert('Please sign in to add items to your wishlist')
      return
    }

    setIsAddingToWishlist(true)
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })
      
      if (response.ok) {
        alert('Added to wishlist!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add to wishlist')
      }
    } catch (error) {
      console.error('Add to wishlist error:', error)
      alert('Failed to add to wishlist')
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {product.stockQuantity === 0 && (
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
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToWishlist(); }}
          disabled={isAddingToWishlist}
        >
          <Heart className={`h-4 w-4 ${isAddingToWishlist ? 'text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {product.category && (
          <Badge variant="secondary" className="mb-2">
            {product.category.name}
          </Badge>
        )}
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            {product.stockQuantity} in stock
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            className="flex-1" 
            disabled={product.stockQuantity === 0 || isAddingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
          {session?.user && (
            <Button
              variant="outline"
              size="sm"
              disabled={isAddingToWishlist}
              onClick={handleAddToWishlist}
            >
              <Heart className={`h-4 w-4 ${isAddingToWishlist ? 'text-red-500' : ''}`} />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}