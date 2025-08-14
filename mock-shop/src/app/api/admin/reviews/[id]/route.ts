import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

// PATCH /api/admin/reviews/[id] - Approve or reject a review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { isApproved } = await request.json()

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: "isApproved must be a boolean" }, { status: 400 })
    }

    const review = await prisma.review.update({
      where: { id: params.id },
      data: { isApproved },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        product: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
      review
    })
  } catch (error) {
    console.error("Review moderation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    await prisma.review.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Review deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}