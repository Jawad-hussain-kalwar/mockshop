import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { prisma } from "@/lib/prisma"

async function getProducts(
  categorySlug?: string,
  searchQuery?: string,
  minPrice?: number,
  maxPrice?: number,
  sortBy?: string
) {
  const orderBy = (() => {
    switch (sortBy) {
      case 'price-asc':
        return { price: 'asc' as const }
      case 'price-desc':
        return { price: 'desc' as const }
      case 'name-asc':
        return { name: 'asc' as const }
      case 'name-desc':
        return { name: 'desc' as const }
      default:
        return { createdAt: 'desc' as const }
    }
  })()

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug && {
        category: {
          slug: categorySlug
        }
      }),
      ...(searchQuery && {
        OR: [
          {
            name: {
              contains: searchQuery
            }
          },
          {
            description: {
              contains: searchQuery
            }
          }
        ]
      }),
      ...(minPrice !== undefined && {
        price: {
          gte: minPrice
        }
      }),
      ...(maxPrice !== undefined && {
        price: {
          lte: maxPrice
        }
      })
    },
    include: {
      category: true,
    },
    orderBy
  })

  return products
}

async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
  }>
}) {
  const params = await searchParams
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined

  const products = await getProducts(
    params.category,
    params.search,
    minPrice,
    maxPrice,
    params.sortBy
  )
  const categories = await getCategories()

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64">
            <ProductFilters
              categories={categories}
              currentCategory={params.category}
              currentSearch={params.search}
              currentMinPrice={minPrice}
              currentMaxPrice={maxPrice}
              currentSortBy={params.sortBy}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {params.search
                    ? `Search Results for "${params.search}"`
                    : params.category
                      ? categories.find(c => c.slug === params.category)?.name || 'Products'
                      : 'All Products'}
                </h1>
                {params.search && (
                  <p className="text-sm text-gray-500 mt-1">
                    <a href="/products" className="text-blue-600 hover:underline">
                      ← Back to all products
                    </a>
                  </p>
                )}
              </div>
              <p className="text-gray-600">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {params.search
                    ? `No products found for "${params.search}". Try a different search term.`
                    : 'No products found.'}
                </p>
                {params.search && (
                  <a
                    href="/products"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View All Products
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}