import { test, expect } from '@playwright/test'

const ADMIN = { email: 'admin@mockshop.com', password: 'password123' }

async function signIn(page, creds: { email: string; password: string }) {
  await page.goto('/auth/signin')
  await page.getByLabel('Email').fill(creds.email)
  await page.getByLabel('Password').fill(creds.password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/')
}

async function signOut(page) {
  await page.getByRole('button', { name: 'Sign Out' }).click()
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
}

function shortId(id: string) {
  return id.slice(-8).toUpperCase()
}

test('test3: guest views 2 products, adds 3rd, checks out; admin sees the order', async ({ page }) => {
  // Guest views two products
  await page.goto('/products')
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible()
  await page.locator('a[href^="/products/"]').first().click()
  await page.goBack()
  await expect(page.locator('a[href^="/products/"]').nth(1)).toBeVisible()
  await page.locator('a[href^="/products/"]').nth(1).click()
  await page.goBack()

  // Add third product from grid
  const cartBadge = page.locator('a[href="/cart"] .absolute')
  const before = parseInt((await cartBadge.textContent().catch(() => '0')) || '0', 10)
  await page.getByRole('button', { name: /Add to Cart/i }).nth(2).click()
  await expect(cartBadge).toHaveText(String(before + 1))

  // Checkout as guest
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible()
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click()
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
  await page.getByLabel('First Name').fill('Guest')
  await page.getByLabel('Last Name').fill('User')
  await page.getByLabel('Email').fill('guest@example.com')
  await page.getByLabel('Phone').fill('555-000-0000')
  await page.getByLabel('Address').fill('100 Test Ave')
  await page.getByLabel('City').fill('Springfield')
  await page.getByLabel('State').fill('IL')
  await page.getByLabel('ZIP Code').fill('62704')
  await page.getByRole('button', { name: /Place Order/ }).click()

  await page.waitForURL('**/order-confirmation/**')
  const orderConfirmUrl = page.url()
  const orderId = orderConfirmUrl.split('/').pop()!
  await expect(page.getByRole('heading', { name: /Order Confirmed/i })).toBeVisible()

  // Admin checks orders
  await signIn(page, ADMIN)
  await page.goto('/admin/orders')
  await expect(page.getByRole('heading', { name: /Order Management/i })).toBeVisible()
  await expect(page.getByText(`Order #${shortId(orderId)}`)).toBeVisible()
})

test('test4: admin adds 2 products, guest orders them, admin sees orders and decreased inventory', async ({ page }) => {
  const ts = Date.now()
  const names = [
    `Garden Spade e2e ${ts}`,
    `Garden Hose e2e ${ts}`,
  ]

  // Admin creates two products via API
  await signIn(page, ADMIN)
  const createdIds: string[] = []
  for (const name of names) {
    const body: any = await page.evaluate(async (payload) => {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        throw new Error(`Create failed: ${res.status}`)
      }
      return res.json()
    }, {
      name,
      description: 'E2E test product',
      price: 19.99,
      stockQuantity: 5,
      images: ['/images/placeholder.svg']
    })
    createdIds.push(body.product.id)
  }

  // Sign out to become guest
  await signOut(page)

  // Guest finds products via search and adds both to cart
  await page.goto(`/products?search=${encodeURIComponent(String(ts))}`)
  await expect(page.getByText(names[0])).toBeVisible()
  await expect(page.getByText(names[1])).toBeVisible()
  const cartBadge = page.locator('a[href="/cart"] .absolute')
  const before = parseInt((await cartBadge.textContent().catch(() => '0')) || '0', 10)
  await page.getByRole('button', { name: /Add to Cart/i }).first().click()
  await page.getByRole('button', { name: /Add to Cart/i }).nth(1).click()
  await expect(cartBadge).toHaveText(String(before + 2))

  // Checkout as guest
  await page.goto('/cart')
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click()
  await page.getByLabel('First Name').fill('Guest')
  await page.getByLabel('Last Name').fill('Buyer')
  await page.getByLabel('Email').fill('guest2@example.com')
  await page.getByLabel('Phone').fill('555-111-2222')
  await page.getByLabel('Address').fill('200 Market St')
  await page.getByLabel('City').fill('Metropolis')
  await page.getByLabel('State').fill('NY')
  await page.getByLabel('ZIP Code').fill('10001')
  await page.getByRole('button', { name: /Place Order/ }).click()
  await page.waitForURL('**/order-confirmation/**')

  // Admin verifies inventory decreased and orders exist
  await signIn(page, ADMIN)
  await page.goto(`/admin/products`)
  // Filter via search box
  await page.fill('input[placeholder="Search products..."]', String(ts))
  // Expect both product cards to show Stock: 4
  await expect(page.getByText(names[0])).toBeVisible()
  await expect(page.getByText(/Stock: 4/)).toBeVisible()
  await expect(page.getByText(names[1])).toBeVisible()
  await expect(page.getByText(/Stock: 4/)).toBeVisible()

  await page.goto('/admin/orders')
  await expect(page.getByText(names[0])).toBeVisible()
  await expect(page.getByText(names[1])).toBeVisible()
})

test('test5: adjust inventory extremes, guest orders and catalog reflects availability', async ({ page }) => {
  const ts = Date.now()
  const bigStockName = `Bulk Paper e2e ${ts}`
  const lowStockName = `Rare Widget e2e ${ts}`

  // Admin creates two products and then adjusts stock
  await signIn(page, ADMIN)
  const create = async (name: string, stock: number) => {
    const body: any = await page.evaluate(async (payload) => {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        throw new Error(`Create failed: ${res.status}`)
      }
      return res.json()
    }, {
      name,
      description: 'E2E adjustable stock',
      price: 5.0,
      stockQuantity: stock,
      images: ['/images/placeholder.svg']
    })
    return body.product
  }
  const big = await create(bigStockName, 10)
  const low = await create(lowStockName, 2)

  // Update stocks: one to 200, one to 1
  const getProduct = async (id: string) => {
    const body: any = await page.evaluate(async (pid) => {
      const res = await fetch(`/api/admin/products/${pid}`)
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`)
      }
      return res.json()
    }, id)
    return body.product
  }
  const bigFull = await getProduct(big.id)
  const lowFull = await getProduct(low.id)

  const update = async (p: any, stock: number) => {
    await page.evaluate(async (payload) => {
      const res = await fetch(`/api/admin/products/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.body)
      })
      if (!res.ok) {
        throw new Error(`Update failed: ${res.status}`)
      }
    }, {
      id: p.id,
      body: {
        name: p.name,
        description: p.description || '',
        price: p.price,
        categoryId: p.category?.id || null,
        stockQuantity: stock,
        images: Array.isArray(p.images) ? p.images : (JSON.parse(p.images || '[]')?.length ? JSON.parse(p.images) : ['/images/placeholder.svg']),
        isActive: true,
      }
    })
  }
  await update(bigFull, 200)
  await update(lowFull, 1)

  // Guest orders both (depletes the low one to 0)
  await signOut(page)
  await page.goto(`/products?search=${encodeURIComponent(String(ts))}`)
  await expect(page.getByText(bigStockName)).toBeVisible()
  await expect(page.getByText(lowStockName)).toBeVisible()
  await page.getByRole('button', { name: /Add to Cart/i }).first().click() // big
  await page.getByRole('button', { name: /Add to Cart/i }).nth(1).click() // low (qty 1)
  await page.goto('/cart')
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click()
  await page.getByLabel('First Name').fill('Guest')
  await page.getByLabel('Last Name').fill('Edge')
  await page.getByLabel('Email').fill('guest3@example.com')
  await page.getByLabel('Phone').fill('555-333-4444')
  await page.getByLabel('Address').fill('300 Elm St')
  await page.getByLabel('City').fill('Gotham')
  await page.getByLabel('State').fill('NJ')
  await page.getByLabel('ZIP Code').fill('07097')
  await page.getByRole('button', { name: /Place Order/ }).click()
  await page.waitForURL('**/order-confirmation/**')

  // Catalog reflects: low is out of stock, big is still available
  await page.goto(`/products?search=${encodeURIComponent(String(ts))}`)
  const lowCard = page.getByText(lowStockName).locator('..').locator('..')
  await expect(page.getByText(bigStockName)).toBeVisible()
  // Out of Stock badge should be visible for low stock product
  await expect(page.getByText('Out of Stock')).toBeVisible()
})


