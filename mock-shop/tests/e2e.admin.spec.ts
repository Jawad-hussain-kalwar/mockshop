import { test, expect } from '@playwright/test'

const ADMIN = { email: 'admin@mockshop.com', password: 'password123' }

async function adminSignIn(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL(/\/auth\/signin/)
  await page.getByLabel('Email').fill(ADMIN.email)
  await page.getByLabel('Password').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/')
}

test.describe('Admin flow', () => {
  test('sign in, open admin dashboard, view products and orders, update an order status', async ({ page }) => {
    await adminSignIn(page)

    // Go to Admin via header link (button text or icon varies)
    // Disambiguate the Admin link by its href
    await page.locator('a[href="/admin"]').first().click()
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toBeVisible()

    // Navigate to Products
    await page.getByRole('button', { name: /Manage Products/ }).click()
    await expect(page).toHaveURL(/\/admin\/products/)
    await expect(page.getByRole('heading', { name: /Product Management/i })).toBeVisible()

    // Navigate to Orders
    await page.goto('/admin/orders')
    await expect(page.getByRole('heading', { name: /Order Management/i })).toBeVisible()

    // If there is at least one order, update its status
    const anyOrder = page.locator('text=Order #').first()
    const hasOrder = await anyOrder.count()
    if (hasOrder > 0) {
      // open first order status dropdown and switch to CONFIRMED
      const firstStatusSelect = page.locator('button[role="combobox"]').first()
      await firstStatusSelect.click()
      await page.getByRole('option', { name: 'Confirmed' }).click()
      await expect(page.locator('text=CONFIRMED').first()).toBeVisible()
    }
  })
})


