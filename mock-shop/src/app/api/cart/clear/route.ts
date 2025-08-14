import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/cart/clear - Clear all items from the authenticated user's cart
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
    if (!cart) {
      return NextResponse.json({ message: "Cart already empty" })
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return NextResponse.json({ message: "Cart cleared" })
  } catch (error) {
    console.error("Clear cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


