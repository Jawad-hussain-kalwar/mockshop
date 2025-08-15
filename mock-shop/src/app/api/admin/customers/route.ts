import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

// GET /api/admin/customers - Get all customers for admin
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'

    // Build where clause
    const where: any = {}
    
    if (search) {
      // SQLite doesn't support case-insensitive mode, so we'll use contains without mode
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } }
      ]
    }

    if (role !== 'all') {
      where.role = role
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await prisma.order.findMany({
          where: { userId: customer.id },
          select: { total: true }
        })
        
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
        
        return {
          ...customer,
          totalSpent,
          orderCount: customer._count.orders,
          reviewCount: customer._count.reviews
        }
      })
    )

    return NextResponse.json({ customers: customersWithStats })
  } catch (error) {
    console.error("Admin customers fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}