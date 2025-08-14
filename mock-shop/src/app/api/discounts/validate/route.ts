import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/discounts/validate - Validate discount code
export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Discount code is required" }, { status: 400 })
    }

    const discount = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!discount) {
      return NextResponse.json({ error: "Invalid discount code" }, { status: 404 })
    }

    // Check if discount is active
    if (!discount.isActive) {
      return NextResponse.json({ error: "This discount code is no longer active" }, { status: 400 })
    }

    // Check expiration
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return NextResponse.json({ error: "This discount code has expired" }, { status: 400 })
    }

    // Check usage limit
    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 400 })
    }

    // Check minimum order amount
    if (discount.minOrderAmount && orderTotal < discount.minOrderAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount of $${discount.minOrderAmount.toFixed(2)} required for this discount` 
      }, { status: 400 })
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (orderTotal * discount.value) / 100
    } else {
      discountAmount = discount.value
    }

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, orderTotal)

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: discountAmount
      }
    })
  } catch (error) {
    console.error("Discount validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}