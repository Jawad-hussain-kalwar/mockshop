import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

// GET /api/admin/orders/[id] - Get specific order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin order fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { status } = await request.json()

    if (!status || !['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { id } = await params
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      message: "Order status updated successfully",
      order 
    })
  } catch (error) {
    console.error("Order status update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}