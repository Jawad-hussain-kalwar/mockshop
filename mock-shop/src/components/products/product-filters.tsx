"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
  currentCategory?: string
  currentSearch?: string
  currentMinPrice?: number
  currentMaxPrice?: number
  currentSortBy?: string
}

export function ProductFilters({
  categories,
  currentCategory,
  currentSearch,
  currentMinPrice,
  currentMaxPrice,
  currentSortBy
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "")
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "")

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/products?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    updateFilters({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined
    })
  }

  const clearFilters = () => {
    setMinPrice("")
    setMaxPrice("")
    router.push("/products")
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            href="/products"
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              !currentCategory
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Products
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                currentCategory === category.slug
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={currentSortBy || "newest"}
            onValueChange={(value) => updateFilters({ sortBy: value === "newest" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <Button onClick={handlePriceFilter} className="w-full" size="sm">
            Apply Price Filter
          </Button>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {(currentCategory || currentSearch || currentMinPrice || currentMaxPrice || currentSortBy) && (
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  )
}