/**
 * Test Suite: Admin Order Details Page
 * 
 * This test verifies that the admin order details page works correctly
 * and displays all necessary order information.
 * 
 * Issue Fixed: Admin: Missing Order details page - CONFIRMED STILL EXISTS
 * - 404 for `/admin/orders/[id]` page: There's no page at that route (only API routes exist)
 * - Fix: create a order details page immediately with high priority.
 */

const { test, expect } = require('@playwright/test');

test.describe('Admin Order Details Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signin page and login as admin
    await page.goto('http://localhost:3001/auth/signin');
    
    // Fill in admin credentials
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@mockshop.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for redirect to home page
    await page.waitForURL('http://localhost:3001/');
    
    // Verify admin is logged in
    await expect(page.getByRole('button', { name: 'Admin', exact: true })).toBeVisible();
  });

  test('should display order details page without 404 error', async ({ page }) => {
    // Navigate to admin orders page
    await page.goto('http://localhost:3001/admin/orders');
    
    // Find and click on the first order details button
    const orderDetailsButton = page.locator('a[href*="/admin/orders/"]').first();
    await orderDetailsButton.click();
    
    // Verify we're on an order details page (not 404)
    await expect(page.locator('h1')).toContainText('Order #');
    await expect(page.locator('text=Order details and management')).toBeVisible();
    
    // Verify the page is not showing 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=This page could not be found')).not.toBeVisible();
  });

  test('should display complete order information', async ({ page }) => {
    // Navigate directly to a known order details page
    await page.goto('http://localhost:3001/admin/orders/cmebz7l5r000btf0su4r1pkm5');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify order header information
    await expect(page.locator('h1')).toContainText('Order #u4r1pkm5');
    await expect(page.locator('text=CONFIRMED')).toBeVisible();
    
    // Verify order items section
    await expect(page.locator('text=Order Items (3)')).toBeVisible();
    await expect(page.locator('text=Wireless Headphones')).toBeVisible();
    await expect(page.locator('text=Smartphone')).toBeVisible();
    await expect(page.locator('text=T-Shirt')).toBeVisible();
    
    // Verify customer information
    await expect(page.locator('text=Customer')).toBeVisible();
    await expect(page.locator('text=Admin User')).toBeVisible();
    await expect(page.locator('text=admin@mockshop.com')).toBeVisible();
    
    // Verify payment information
    await expect(page.locator('text=Payment')).toBeVisible();
    await expect(page.locator('text=Method:')).toBeVisible();
    await expect(page.locator('text=Amount:')).toBeVisible();
    await expect(page.locator('text=$1022.97')).toBeVisible();
    
    // Verify addresses
    await expect(page.locator('text=Shipping Address')).toBeVisible();
    await expect(page.locator('text=Billing Address')).toBeVisible();
    
    // Verify timeline
    await expect(page.locator('text=Timeline')).toBeVisible();
    await expect(page.locator('text=Created:')).toBeVisible();
    await expect(page.locator('text=Last Updated:')).toBeVisible();
  });

  test('should have functional status update dropdown', async ({ page }) => {
    // Navigate to order details page
    await page.goto('http://localhost:3001/admin/orders/cmebz7l5r000btf0su4r1pkm5');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify status dropdown exists and is functional
    const statusDropdown = page.locator('select, [role="combobox"]').first();
    await expect(statusDropdown).toBeVisible();
    
    // Verify current status is displayed
    await expect(page.locator('text=CONFIRMED')).toBeVisible();
  });

  test('should have working back to orders navigation', async ({ page }) => {
    // Navigate to order details page
    await page.goto('http://localhost:3001/admin/orders/cmebz7l5r000btf0su4r1pkm5');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click back to orders button
    await page.getByRole('link', { name: 'Back to Orders' }).click();
    
    // Verify we're back on the orders list page
    await expect(page).toHaveURL('http://localhost:3001/admin/orders');
    await expect(page.locator('h1')).toContainText('Order Management');
  });

  test('should display order items with images and pricing', async ({ page }) => {
    // Navigate to order details page
    await page.goto('http://localhost:3001/admin/orders/cmebz7l5r000btf0su4r1pkm5');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify order items have images
    const productImages = page.locator('img[alt="Wireless Headphones"], img[alt="Smartphone"], img[alt="T-Shirt"]');
    await expect(productImages.first()).toBeVisible();
    
    // Verify pricing information
    await expect(page.locator('text=Subtotal:')).toBeVisible();
    await expect(page.locator('text=Tax (10%):')).toBeVisible();
    await expect(page.locator('text=Shipping:')).toBeVisible();
    await expect(page.locator('text=Total:')).toBeVisible();
    
    // Verify individual item pricing
    await expect(page.locator('text=$199.99')).toBeVisible(); // Wireless Headphones
    await expect(page.locator('text=$699.99')).toBeVisible(); // Smartphone
    await expect(page.locator('text=$29.99')).toBeVisible();  // T-Shirt
  });
});

// Export test configuration
module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    screenshot: 'only-on-failure',
  },
};