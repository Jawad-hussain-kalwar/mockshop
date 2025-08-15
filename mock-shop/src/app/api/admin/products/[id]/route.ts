import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/products/[id] - Get single product for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Admin product fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const {
      name,
      description,
      price,
      categoryId,
      stockQuantity,
      images,
      isActive
    } = await request.json()

    // Validate required fields
    if (!name || !price || stockQuantity === undefined) {
      return NextResponse.json({ 
        error: "Name, price, and stock quantity are required" 
      }, { status: 400 })
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 })
      }
    }

    const { id } = await params
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: categoryId || null,
        stockQuantity: parseInt(stockQuantity),
        images: JSON.stringify(images || ['/images/placeholder.svg']),
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: "Product updated successfully",
      product 
    })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/products/[id] - Partial update (e.g., toggle active status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const updateData = await request.json()

    const { id } = await params
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: "Product updated successfully",
      product 
    })
  } catch (error) {
    console.error("Product patch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if product has any orders (prevent deletion if it does)
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id }
    })

    if (orderItems) {
      return NextResponse.json({ 
        error: "Cannot delete product with existing orders. Consider deactivating instead." 
      }, { status: 400 })
    }

    // Delete related cart items first
    await prisma.cartItem.deleteMany({
      where: { productId: id }
    })

    // Delete related wishlist items
    await prisma.wishlist.deleteMany({
      where: { productId: id }
    })

    // Delete related reviews
    await prisma.review.deleteMany({
      where: { productId: id }
    })

    // Finally delete the product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Product deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}