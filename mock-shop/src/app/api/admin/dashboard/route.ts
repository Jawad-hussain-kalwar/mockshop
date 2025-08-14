import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch dashboard statistics
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      lowStockProducts,
      pendingOrders,
      revenueData
    ] = await Promise.all([
      // Total products
      prisma.product.count({
        where: { isActive: true }
      }),
      
      // Total orders
      prisma.order.count(),
      
      // Total customers
      prisma.user.count({
        where: { role: "CUSTOMER" }
      }),
      
      // Low stock products (less than 10 items)
      prisma.product.count({
        where: {
          isActive: true,
          stockQuantity: {
            lt: 10
          }
        }
      }),
      
      // Pending orders
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      
      // Total revenue
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          status: {
            in: ["CONFIRMED", "SHIPPED", "DELIVERED"]
          }
        }
      })
    ])

    const stats = {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: revenueData._sum.total || 0,
      lowStockProducts,
      pendingOrders
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}