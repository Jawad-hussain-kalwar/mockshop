import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/data-export - Export user data
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        wishlist: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        cart: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive data
    const { password, ...userDataWithoutPassword } = userData

    // Create export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: userDataWithoutPassword,
      summary: {
        totalOrders: userData.orders.length,
        totalReviews: userData.reviews.length,
        wishlistItems: userData.wishlist.length,
        cartItems: userData.cart?.items.length || 0
      }
    }

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error("Data export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}