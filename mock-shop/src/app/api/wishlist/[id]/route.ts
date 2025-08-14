import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/wishlist/[id] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wishlistItemId = params.id

    // Verify ownership and delete
    const result = await prisma.wishlist.deleteMany({
      where: {
        id: wishlistItemId,
        userId: session.user.id
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item removed from wishlist" })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}