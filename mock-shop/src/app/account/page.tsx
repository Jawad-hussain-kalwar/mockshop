"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Package, Heart, Settings, Shield } from "lucide-react"
import Link from "next/link"

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600">Welcome back, {session.user.name}!</p>
        </div>

        {/* Admin Dashboard Card - Only show for admin users */}
        {session.user.role === "ADMIN" && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/admin">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="h-6 w-6" />
                    Admin Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100">
                    Manage products, orders, customers, and shop settings
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Profile Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/account/profile">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage your personal information and preferences
                </p>
              </CardContent>
            </Link>
          </Card>

          {/* Orders Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/account/orders">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View your order history and track shipments
                </p>
              </CardContent>
            </Link>
          </Card>

          {/* Wishlist Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/account/wishlist">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5" />
                  Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Save items for later and track price changes
                </p>
              </CardContent>
            </Link>
          </Card>

          {/* Settings Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/account/settings">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Update your account settings and preferences
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/account/orders">
                <Button variant="outline">
                  Track Orders
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline">
                  View Cart
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}