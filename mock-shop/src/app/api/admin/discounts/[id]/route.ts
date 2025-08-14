import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

// PATCH /api/admin/discounts/[id] - Update discount code
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 })
    }

    const discount = await prisma.discountCode.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({
      message: `Discount code ${isActive ? 'activated' : 'deactivated'} successfully`,
      discount
    })
  } catch (error) {
    console.error("Discount update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/discounts/[id] - Delete discount code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    await prisma.discountCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Discount code deleted successfully" })
  } catch (error) {
    console.error("Discount deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}