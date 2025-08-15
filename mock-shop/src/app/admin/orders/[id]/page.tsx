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
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Package,
  User,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  Truck
} from "lucide-react"

interface OrderDetails {
  id: string
  status: string
  subtotal: number
  discountAmount: number
  total: number
  createdAt: string
  updatedAt: string
  shippingAddress: any
  billingAddress: any
  paymentMethod: string
  discountCode: string | null
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  } | null
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      images: string
      price: number
    }
  }[]
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    getParams()
  }, [params])

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
    if (orderId) {
      fetchOrderDetails()
    }
  }, [session, status, router, orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        console.error('Failed to fetch order details')
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        alert('Order status updated successfully')
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading order details...</div>
        </main>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-4">The requested order could not be found.</p>
            <Link href="/admin/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const shippingAddr = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress

  const billingAddr = typeof order.billingAddress === 'string' 
    ? JSON.parse(order.billingAddress) 
    : order.billingAddress

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/orders" className="mb-4 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
              <p className="text-gray-600">Order details and management</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                {order.status}
              </Badge>
              <Select 
                value={order.status} 
                onValueChange={updateOrderStatus}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const images = JSON.parse(item.product.images) as string[]
                    const primaryImage = images[0] || '/images/placeholder.svg'
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={primaryImage}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <Separator className="my-4" />
                
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {order.discountCode && `(${order.discountCode})`}:</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${((order.subtotal - order.discountAmount) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>$10.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Information */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.user ? (
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">Guest Order</p>
                )}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm">
                      {new Date(order.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Method:</span>
                    <span className="text-sm capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-semibold">
                    {shippingAddr.firstName} {shippingAddr.lastName}
                  </p>
                  <p>{shippingAddr.address}</p>
                  <p>
                    {shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}
                  </p>
                  <p>{shippingAddr.country}</p>
                  {shippingAddr.phone && <p>Phone: {shippingAddr.phone}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-semibold">
                    {billingAddr.firstName} {billingAddr.lastName}
                  </p>
                  <p>{billingAddr.address}</p>
                  <p>
                    {billingAddr.city}, {billingAddr.state} {billingAddr.zipCode}
                  </p>
                  <p>{billingAddr.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}