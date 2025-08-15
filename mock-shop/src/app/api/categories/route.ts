import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/categories - Get all active categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}