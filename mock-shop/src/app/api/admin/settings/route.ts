import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.shopSettings.findFirst()
  return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const existing = await prisma.shopSettings.findFirst()
  const data = {
    shopName: body.shopName ?? "Mock Shop",
    shopDescription: body.shopDescription ?? null,
    contactEmail: body.contactEmail ?? null,
    contactPhone: body.contactPhone ?? null,
    address: body.address ?? null,
    city: body.city ?? null,
    state: body.state ?? null,
    zipCode: body.zipCode ?? null,
    country: body.country ?? null,
    currency: body.currency ?? "USD",
    taxRate: typeof body.taxRate === 'number' ? body.taxRate : 10,
    freeShippingThreshold: typeof body.freeShippingThreshold === 'number' ? body.freeShippingThreshold : 100,
  }

  const settings = existing
    ? await prisma.shopSettings.update({ where: { id: existing.id }, data })
    : await prisma.shopSettings.create({ data })

  return NextResponse.json({ settings })
}


