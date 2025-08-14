"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Users
} from "lucide-react"

interface DiscountCode {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  currentUses: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminDiscountsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: ''
  })

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
    fetchDiscounts()
  }, [session, status, router])

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/admin/discounts')
      if (response.ok) {
        const data = await response.json()
        setDiscounts(data.discounts || [])
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          type: formData.type,
          value: formData.value,
          minOrderAmount: formData.minOrderAmount || null,
          maxUses: formData.maxUses || null,
          expiresAt: formData.expiresAt || null
        })
      })

      if (response.ok) {
        alert('Discount code created successfully')
        setShowCreateForm(false)
        setFormData({
          code: '',
          type: 'PERCENTAGE',
          value: '',
          minOrderAmount: '',
          maxUses: '',
          expiresAt: ''
        })
        fetchDiscounts()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create discount code')
      }
    } catch (error) {
      console.error('Failed to create discount:', error)
      alert('Failed to create discount code')
    }
  }

  const toggleDiscountStatus = async (discountId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/discounts/${discountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setDiscounts(prev => 
          prev.map(discount => 
            discount.id === discountId ? { ...discount, isActive: !isActive } : discount
          )
        )
      } else {
        alert('Failed to update discount status')
      }
    } catch (error) {
      console.error('Failed to update discount status:', error)
      alert('Failed to update discount status')
    }
  }

  const deleteDiscount = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/discounts/${discountId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDiscounts(prev => prev.filter(d => d.id !== discountId))
        alert('Discount code deleted successfully')
      } else {
        alert('Failed to delete discount code')
      }
    } catch (error) {
      console.error('Failed to delete discount:', error)
      alert('Failed to delete discount code')
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading discounts...</div>
        </main>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="mb-4 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Discount Codes</h1>
              <p className="text-gray-600">Create and manage promotional discount codes</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Discount
          </Button>
        </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Discount Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDiscount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Discount Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="SAVE20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'PERCENTAGE' | 'FIXED') => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">
                      {formData.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount ($)'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                      min="0"
                      max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minOrderAmount">Minimum Order Amount ($)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxUses">Maximum Uses</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expiration Date</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Discount</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Discounts List */}
        <div className="space-y-4">
          {discounts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Percent className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No discount codes created yet.</p>
              </CardContent>
            </Card>
          ) : (
            discounts.map((discount) => (
              <Card key={discount.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{discount.code}</h3>
                        <Badge variant={discount.isActive ? "default" : "secondary"}>
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {discount.expiresAt && new Date(discount.expiresAt) < new Date() && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          {discount.type === 'PERCENTAGE' ? (
                            <Percent className="h-4 w-4" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                          <span>
                            {discount.type === 'PERCENTAGE' 
                              ? `${discount.value}% off` 
                              : `$${discount.value.toFixed(2)} off`
                            }
                          </span>
                        </div>
                        
                        {discount.minOrderAmount && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Min: ${discount.minOrderAmount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {discount.maxUses && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{discount.currentUses}/{discount.maxUses} uses</span>
                          </div>
                        )}
                        
                        {discount.expiresAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Expires: {new Date(discount.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDiscountStatus(discount.id, discount.isActive)}
                      >
                        {discount.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDiscount(discount.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}