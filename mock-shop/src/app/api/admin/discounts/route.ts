import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

// GET /api/admin/discounts - Get all discount codes
export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const discounts = await prisma.discountCode.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ discounts })
  } catch (error) {
    console.error("Admin discounts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/discounts - Create new discount code
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxUses,
      expiresAt
    } = await request.json()

    // Validate required fields
    if (!code || !type || !value) {
      return NextResponse.json({ 
        error: "Code, type, and value are required" 
      }, { status: 400 })
    }

    // Validate type
    if (!['PERCENTAGE', 'FIXED'].includes(type)) {
      return NextResponse.json({ error: "Invalid discount type" }, { status: 400 })
    }

    // Validate value
    if (type === 'PERCENTAGE' && (value <= 0 || value > 100)) {
      return NextResponse.json({ error: "Percentage must be between 1 and 100" }, { status: 400 })
    }

    if (type === 'FIXED' && value <= 0) {
      return NextResponse.json({ error: "Fixed amount must be greater than 0" }, { status: 400 })
    }

    // Check if code already exists
    const existingCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCode) {
      return NextResponse.json({ error: "Discount code already exists" }, { status: 400 })
    }

    const discount = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    return NextResponse.json({ 
      message: "Discount code created successfully",
      discount 
    }, { status: 201 })
  } catch (error) {
    console.error("Discount creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}