"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string
    stockQuantity: number
  }
}

export default function CartPage() {
  const { data: session } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchCartItems()
    } else {
      // Load from localStorage for non-authenticated users
      const localCart = localStorage.getItem('cart')
      if (localCart) {
        setCartItems(JSON.parse(localCart))
      }
      setIsLoading(false)
    }
  }, [session])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    try {
      if (session?.user) {
        await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity: newQuantity })
        })
      } else {
        // Update localStorage for non-authenticated users
        const updatedItems = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
        setCartItems(updatedItems)
        localStorage.setItem('cart', JSON.stringify(updatedItems))
      }
      
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      if (session?.user) {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId })
        })
      } else {
        // Update localStorage for non-authenticated users
        const updatedItems = cartItems.filter(item => item.id !== itemId)
        setCartItems(updatedItems)
        localStorage.setItem('cart', JSON.stringify(updatedItems))
      }
      
      setCartItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading cart...</div>
        </main>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const images = JSON.parse(item.product.images) as string[]
              const primaryImage = images[0] || '/images/placeholder.svg'
              
              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={primaryImage}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                          sizes="64px"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-gray-600">${item.product.price.toFixed(2)} each</p>
                        {item.product.stockQuantity < 10 && (
                          <Badge variant="destructive" className="mt-1">
                            Only {item.product.stockQuantity} left
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Link href="/checkout">
                  <Button className="w-full mb-3" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}