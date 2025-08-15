import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

// GET /api/admin/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Basic stats
    const [totalProducts, totalCustomers, totalOrders, totalRevenue] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true }
      }).then(result => result._sum.total || 0)
    ])

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Revenue over time (daily for last 30 days, weekly for longer periods)
    const revenueOverTime = await getRevenueOverTime(startDate, endDate, periodDays)

    // Top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { productId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    })

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true }
        })
        return {
          ...item,
          product
        }
      })
    )

    // Customer acquisition over time
    const customerAcquisition = await getCustomerAcquisition(startDate, endDate, periodDays)

    // Category performance
    const categoryPerformance = await getCategoryPerformance(startDate, endDate)

    // Recent activity
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Low stock alerts
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQuantity: { lt: 10 },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        price: true
      },
      orderBy: { stockQuantity: 'asc' }
    })

    return NextResponse.json({
      period: periodDays,
      basicStats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue
      },
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      revenueOverTime,
      topProducts: topProductsWithDetails.map(item => ({
        productId: item.productId,
        name: item.product?.name || 'Unknown Product',
        price: item.product?.price || 0,
        quantitySold: item._sum.quantity || 0,
        orderCount: item._count.productId
      })),
      customerAcquisition,
      categoryPerformance,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
        itemCount: order.items.length
      })),
      lowStockProducts
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getRevenueOverTime(startDate: Date, endDate: Date, periodDays: number) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      total: true,
      createdAt: true
    }
  })

  // Group by day or week depending on period
  const groupBy = periodDays <= 30 ? 'day' : 'week'
  const revenueMap = new Map<string, number>()

  orders.forEach(order => {
    let key: string
    if (groupBy === 'day') {
      key = order.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
    } else {
      // Group by week
      const weekStart = new Date(order.createdAt)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      key = weekStart.toISOString().split('T')[0]
    }
    
    revenueMap.set(key, (revenueMap.get(key) || 0) + order.total)
  })

  // Fill in missing dates with 0
  const result = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0]
    result.push({
      date: key,
      revenue: revenueMap.get(key) || 0
    })
    
    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1)
    } else {
      current.setDate(current.getDate() + 7)
    }
  }

  return result
}

async function getCustomerAcquisition(startDate: Date, endDate: Date, periodDays: number) {
  const customers = await prisma.user.findMany({
    where: {
      role: 'CUSTOMER',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true
    }
  })

  const groupBy = periodDays <= 30 ? 'day' : 'week'
  const acquisitionMap = new Map<string, number>()

  customers.forEach(customer => {
    let key: string
    if (groupBy === 'day') {
      key = customer.createdAt.toISOString().split('T')[0]
    } else {
      const weekStart = new Date(customer.createdAt)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      key = weekStart.toISOString().split('T')[0]
    }
    
    acquisitionMap.set(key, (acquisitionMap.get(key) || 0) + 1)
  })

  // Fill in missing dates with 0
  const result = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0]
    result.push({
      date: key,
      customers: acquisitionMap.get(key) || 0
    })
    
    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1)
    } else {
      current.setDate(current.getDate() + 7)
    }
  }

  return result
}

async function getCategoryPerformance(startDate: Date, endDate: Date) {
  const categoryData = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true, price: true },
    where: {
      order: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }
  })

  // Get category information for each product
  const categoryPerformance = new Map<string, { revenue: number, quantity: number }>()

  for (const item of categoryData) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { category: true }
    })

    if (product?.category) {
      const categoryName = product.category.name
      const current = categoryPerformance.get(categoryName) || { revenue: 0, quantity: 0 }
      
      categoryPerformance.set(categoryName, {
        revenue: current.revenue + (item._sum.price || 0),
        quantity: current.quantity + (item._sum.quantity || 0)
      })
    }
  }

  return Array.from(categoryPerformance.entries()).map(([name, data]) => ({
    category: name,
    revenue: data.revenue,
    quantity: data.quantity
  }))
}