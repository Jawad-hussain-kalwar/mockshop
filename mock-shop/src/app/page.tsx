import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Mock Shop</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover amazing products at great prices
          </p>
          <Link href="/products">
            <Button size="lg">
              Shop Now
            </Button>
          </Link>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Electronics</CardTitle>
                <CardDescription>Latest gadgets and tech</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/products?category=electronics">
                  <Button variant="outline" className="w-full">
                    Browse Electronics
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Clothing</CardTitle>
                <CardDescription>Fashion for everyone</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/products?category=clothing">
                  <Button variant="outline" className="w-full">
                    Browse Clothing
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Home & Garden</CardTitle>
                <CardDescription>Everything for your home</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/products?category=home">
                  <Button variant="outline" className="w-full">
                    Browse Home & Garden
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}