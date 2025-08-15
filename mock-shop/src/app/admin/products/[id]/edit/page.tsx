"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
  Save
} from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stockQuantity: number
  images: string
  isActive: boolean
  categoryId: string | null
  category: {
    id: string
    name: string
  } | null
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [productId, setProductId] = useState<string>("")
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stockQuantity: "",
    isActive: true,
    images: ["/images/placeholder.svg"]
  })

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    // Fetch categories from API
    fetchCategories()

    if (productId) {
      fetchProduct()
    }
  }, [session, status, router, productId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const product = data.product
        setProduct(product)
        
        // Populate form with product data
        setFormData({
          name: product.name,
          description: product.description || "",
          price: product.price.toString(),
          categoryId: product.categoryId || "none",
          stockQuantity: product.stockQuantity.toString(),
          isActive: product.isActive,
          images: JSON.parse(product.images)
        })
      } else {
        alert("Product not found")
        router.push("/admin/products")
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      alert('Failed to load product')
      router.push("/admin/products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === "images" && typeof value === "string") {
      // Parse the JSON string back to array for images
      setFormData(prev => ({
        ...prev,
        [field]: JSON.parse(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.price || !formData.stockQuantity) {
      alert("Please fill in all required fields")
      return
    }

    if (parseFloat(formData.price) <= 0) {
      alert("Price must be greater than 0")
      return
    }

    if (parseInt(formData.stockQuantity) < 0) {
      alert("Stock quantity cannot be negative")
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          categoryId: formData.categoryId === "none" ? null : formData.categoryId || null,
          stockQuantity: parseInt(formData.stockQuantity),
          isActive: formData.isActive,
          images: formData.images
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert("Product updated successfully!")
        router.push("/admin/products")
      } else {
        const errorData = await response.json()
        alert(`Failed to update product: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      alert('Failed to update product. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading product...</div>
        </main>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">The requested product could not be found.</p>
            <Link href="/admin/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/products" className="mb-4 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-gray-600">Update product information</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Product is active</Label>
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Images */}
                <FileUpload
                  onUpload={(url) => handleInputChange("images", JSON.stringify([url]))}
                  currentImage={formData.images[0]}
                  disabled={isSaving}
                />

                {/* Submit Button */}
                <div className="flex items-center gap-4 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Link href="/admin/products">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}