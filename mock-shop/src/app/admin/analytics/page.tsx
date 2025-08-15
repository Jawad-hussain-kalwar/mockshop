"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SimpleChart } from "@/components/ui/simple-chart"
import { 
  ArrowLeft, 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Calendar
} from "lucide-react"

interface AnalyticsData {
  period: number
  basicStats: {
    totalProducts: number
    totalOrders: number
    totalCustomers: number
    totalRevenue: number
  }
  ordersByStatus: Array<{
    status: string
    count: number
  }>
  revenueOverTime: Array<{
    date: string
    revenue: number
  }>
  topProducts: Array<{
    productId: string
    name: string
    price: number
    quantitySold: number
    orderCount: number
  }>
  customerAcquisition: Array<{
    date: string
    customers: number
  }>
  categoryPerformance: Array<{
    category: string
    revenue: number
    quantity: number
  }>
  recentOrders: Array<{
    id: string
    total: number
    status: string
    createdAt: string
    customer: string
    itemCount: number
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    stockQuantity: number
    price: number
  }>
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState("30")

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
    fetchAnalytics()
  }, [session, status, router, period])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (e) {
      console.error("Failed to load analytics", e)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading analytics...</div>
        </main>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Analytics & Reports
              </h1>
              <p className="text-gray-600">Comprehensive store performance insights</p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading analytics...</div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ShoppingBag className="h-4 w-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.basicStats.totalRevenue.toFixed(2)}</div>
                  <p className="text-sm text-gray-500">From {analytics.basicStats.totalOrders} orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" />
                    Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.basicStats.totalProducts}</div>
                  <p className="text-sm text-gray-500">{analytics.lowStockProducts.length} low in stock</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.basicStats.totalCustomers}</div>
                  <p className="text-sm text-gray-500">Total registered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Avg Order Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics.basicStats.totalOrders > 0 
                      ? (analytics.basicStats.totalRevenue / analytics.basicStats.totalOrders).toFixed(2)
                      : '0.00'
                    }
                  </div>
                  <p className="text-sm text-gray-500">Per order</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="line"
                    data={analytics.revenueOverTime.map(item => ({
                      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      value: item.revenue
                    }))}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="pie"
                    data={analytics.ordersByStatus.map(item => ({
                      label: item.status,
                      value: item.count
                    }))}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="bar"
                    data={analytics.topProducts.map(item => ({
                      label: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
                      value: item.quantitySold
                    }))}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    type="bar"
                    data={analytics.categoryPerformance.map(item => ({
                      label: item.category,
                      value: item.revenue
                    }))}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">#{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.lowStockProducts.slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-600">{product.stockQuantity} left</p>
                          <p className="text-sm text-gray-600">Low stock</p>
                        </div>
                      </div>
                    ))}
                    {analytics.lowStockProducts.length === 0 && (
                      <p className="text-gray-500 text-center py-4">All products are well stocked!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No analytics data available.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}


