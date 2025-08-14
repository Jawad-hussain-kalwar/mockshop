import { test, expect } from '@playwright/test'

const CUSTOMER = { email: 'customer@mockshop.com', password: 'password123' }

test.describe('Customer flow', () => {
  test('sign in, browse, add to cart, checkout with COD, see confirmation', async ({ page }) => {
    // Go to home
    await page.goto('/')
    await expect(page).toHaveTitle(/Mock Shop/i)

    // Navigate to sign in
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Sign in
    await page.getByLabel('Email').fill(CUSTOMER.email)
    await page.getByLabel('Password').fill(CUSTOMER.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('**/')

    // Go to products
    await page.goto('/products')
    await expect(page.getByRole('heading', { name: /Products|All Products|Search Results/i })).toBeVisible()

    // Add to cart from grid and wait for cart badge to update
    const cartBadge = page.locator('a[href="/cart"] .absolute')
    const before = await cartBadge.textContent().catch(() => '0')
    await page.getByRole('button', { name: /Add to Cart/i }).first().click()
    await expect(cartBadge).toHaveText((Number(before || '0') + 1).toString(), { timeout: 10000 })

    // Go to cart directly (header cart icon has no accessible name)
    await page.goto('/cart')
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible()

    // Proceed to checkout
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click()
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()

    // Fill shipping form (minimal required fields)
    await page.getByLabel('First Name').fill('Jane')
    await page.getByLabel('Last Name').fill('Doe')
    await page.getByLabel('Email').fill(CUSTOMER.email)
    await page.getByLabel('Phone').fill('555-111-2222')
    await page.getByLabel('Address').fill('1 Main St')
    await page.getByLabel('City').fill('SF')
    await page.getByLabel('State').fill('CA')
    await page.getByLabel('ZIP Code').fill('94102')

    // Payment method left as COD by default

    // Place Order
    const placeOrder = page.getByRole('button', { name: /Place Order/i })
    await placeOrder.click()

    // Confirmation page
    await page.waitForURL('**/order-confirmation/**')
    await expect(page.getByRole('heading', { name: /Order Confirmed/i })).toBeVisible()
    await expect(page.getByText('Order Summary')).toBeVisible()
  })
})


