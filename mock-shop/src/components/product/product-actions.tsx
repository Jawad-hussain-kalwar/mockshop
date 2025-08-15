"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { ShoppingCart, Heart, Share2 } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  images: string
}

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const { data: session } = useSession()
  const { addItem, items } = useCart()
  const router = useRouter()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)

  // Check current quantity in cart
  const currentCartQuantity = items.find(item => item.product.id === product.id)?.quantity || 0
  const canAddToCart = currentCartQuantity < product.stockQuantity
  const remainingStock = product.stockQuantity - currentCartQuantity

  // Check if item is in wishlist on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user) return

      try {
        const response = await fetch("/api/wishlist")
        if (response.ok) {
          const data = await response.json()
          const isInList = data.items.some((item: any) => item.productId === product.id)
          setIsInWishlist(isInList)
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error)
      }
    }

    checkWishlistStatus()
  }, [session, product.id])

  const handleAddToCart = async () => {
    if (!canAddToCart) {
      toast.error("Cannot add more items - insufficient stock available")
      return
    }

    setIsAddingToCart(true)
    try {
      await addItem(product.id, 1)
      toast.success("Added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart"
      if (errorMessage.includes("stock")) {
        toast.error("Cannot add more items - insufficient stock available")
      } else {
        toast.error("Failed to add to cart. Please try again.")
      }
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add items to your wishlist")
      router.push("/auth/signin")
      return
    }

    setIsAddingToWishlist(true)
    try {
      const method = isInWishlist ? "DELETE" : "POST"
      const response = await fetch("/api/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id })
      })

      if (response.ok) {
        setIsInWishlist(!isInWishlist)
        toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist!")
      } else {
        throw new Error("Failed to update wishlist")
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Failed to update wishlist. Please try again.")
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} for $${product.price.toFixed(2)}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log("Share cancelled or failed:", error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Product link copied to clipboard!")
      } catch (error) {
        console.error("Failed to copy to clipboard:", error)
        toast.error("Failed to share product")
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button 
          size="lg" 
          className="w-full"
          disabled={product.stockQuantity === 0 || !canAddToCart || isAddingToCart}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {isAddingToCart ? "Adding..." : 
           product.stockQuantity === 0 ? "Out of Stock" :
           !canAddToCart ? "Already in Cart" : "Add to Cart"}
        </Button>
        {currentCartQuantity > 0 && (
          <p className="text-sm text-gray-600 text-center">
            {currentCartQuantity} in cart • {remainingStock} remaining
          </p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handleWishlistToggle}
          disabled={isAddingToWishlist}
        >
          <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? "fill-current text-red-500" : ""}`} />
          {isAddingToWishlist ? "..." : isInWishlist ? "In Wishlist" : "Wishlist"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  )
}