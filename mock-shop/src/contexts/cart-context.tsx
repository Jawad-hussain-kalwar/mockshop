"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string
  }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  // Fetch cart items
  const refreshCart = async () => {
    if (!session?.user) {
      // Load from localStorage for guest users
      const localCart = localStorage.getItem('cart')
      if (localCart) {
        try {
          setItems(JSON.parse(localCart))
        } catch (error) {
          console.error('Error parsing local cart:', error)
          setItems([])
        }
      } else {
        setItems([])
      }
      return
    }

    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  // Add item to cart
  const addItem = async (productId: string, quantity = 1) => {
    setIsLoading(true)
    try {
      if (session?.user) {
        // Add to database cart for logged-in users
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        })
        
        if (response.ok) {
          await refreshCart()
        } else {
          throw new Error('Failed to add to cart')
        }
      } else {
        // Add to localStorage for guest users
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
        const existingItemIndex = existingCart.findIndex((item: any) => item.product.id === productId)
        
        if (existingItemIndex >= 0) {
          existingCart[existingItemIndex].quantity += quantity
        } else {
          // We need to fetch product details for guest cart
          const productResponse = await fetch(`/api/products/${productId}`)
          if (productResponse.ok) {
            const product = await productResponse.json()
            existingCart.push({
              id: `temp-${Date.now()}`,
              quantity,
              product: {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                images: product.images,
                stockQuantity: product.stockQuantity
              }
            })
          }
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart))
        setItems(existingCart)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    setIsLoading(true)
    try {
      if (session?.user) {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId })
        })
        
        if (response.ok) {
          await refreshCart()
        } else {
          throw new Error('Failed to remove from cart')
        }
      } else {
        // Remove from localStorage for guest users
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
        const updatedCart = existingCart.filter((item: any) => item.id !== itemId)
        localStorage.setItem('cart', JSON.stringify(updatedCart))
        setItems(updatedCart)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId)
    }

    setIsLoading(true)
    try {
      if (session?.user) {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity })
        })
        
        if (response.ok) {
          await refreshCart()
        } else {
          throw new Error('Failed to update cart')
        }
      } else {
        // Update localStorage for guest users
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
        const itemIndex = existingCart.findIndex((item: any) => item.id === itemId)
        if (itemIndex >= 0) {
          existingCart[itemIndex].quantity = quantity
          localStorage.setItem('cart', JSON.stringify(existingCart))
          setItems(existingCart)
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Clear cart
  const clearCart = async () => {
    setIsLoading(true)
    try {
      if (session?.user) {
        // Clear database cart
        const response = await fetch('/api/cart/clear', {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setItems([])
        } else {
          throw new Error('Failed to clear cart')
        }
      } else {
        // Clear localStorage
        localStorage.removeItem('cart')
        setItems([])
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Load cart on mount and when session changes
  useEffect(() => {
    refreshCart()
  }, [session])

  const value: CartContextType = {
    items,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}