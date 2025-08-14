import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/orders - Get user's orders
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const orderData = await request.json()

    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      discountCode,
      discountAmount = 0,
      subtotal,
      total
    } = orderData

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: "Missing required order information" }, { status: 400 })
    }

    // Verify product availability and calculate totals
    let calculatedSubtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json({ 
          error: `Product ${item.productId} not found` 
        }, { status: 404 })
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}` 
        }, { status: 400 })
      }

      calculatedSubtotal += product.price * item.quantity
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      })
    }

    // Validate discount code if provided
    let validDiscountAmount = 0
    if (discountCode) {
      const discount = await prisma.discountCode.findUnique({
        where: { code: discountCode }
      })

      if (!discount || !discount.isActive) {
        return NextResponse.json({ error: "Invalid discount code" }, { status: 400 })
      }

      if (discount.expiresAt && discount.expiresAt < new Date()) {
        return NextResponse.json({ error: "Discount code has expired" }, { status: 400 })
      }

      if (discount.maxUses && discount.currentUses >= discount.maxUses) {
        return NextResponse.json({ error: "Discount code usage limit reached" }, { status: 400 })
      }

      if (discount.minOrderAmount && calculatedSubtotal < discount.minOrderAmount) {
        return NextResponse.json({ 
          error: `Minimum order amount of $${discount.minOrderAmount} required for this discount` 
        }, { status: 400 })
      }

      // Calculate discount amount
      if (discount.type === 'PERCENTAGE') {
        validDiscountAmount = (calculatedSubtotal * discount.value) / 100
      } else {
        validDiscountAmount = Math.min(discount.value, calculatedSubtotal)
      }
    }

    // Create order in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: session?.user?.id || null,
          subtotal: calculatedSubtotal,
          discountAmount: validDiscountAmount,
          total: calculatedSubtotal - validDiscountAmount + (subtotal * 0.1) + (calculatedSubtotal > 100 ? 0 : 9.99), // tax + shipping
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(billingAddress),
          paymentMethod,
          discountCode: discountCode || null,
          status: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Update product stock quantities
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        })
      }

      // Update discount code usage if applicable
      if (discountCode && validDiscountAmount > 0) {
        await tx.discountCode.update({
          where: { code: discountCode },
          data: {
            currentUses: {
              increment: 1
            }
          }
        })
      }

      // Clear user's cart if they're logged in
      if (session?.user?.id) {
        await tx.cartItem.deleteMany({
          where: {
            cart: {
              userId: session.user.id
            }
          }
        })
      }

      return order
    })

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update order status to confirmed
    await prisma.order.update({
      where: { id: result.id },
      data: { status: 'CONFIRMED' }
    })

    return NextResponse.json({ 
      message: "Order created successfully",
      orderId: result.id,
      order: result
    }, { status: 201 })

  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}