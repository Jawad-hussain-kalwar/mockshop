/**
 * Test Suite: Admin Product Management
 * 
 * This test verifies that the admin product create and edit pages work correctly.
 * 
 * Issues Fixed: 
 * - Admin: Add product does not work - `http://localhost:3000/admin/products/new` leads to 404
 * - Admin: Missing product create/edit pages (UI)
 * - Admin: edit product does not work - `http://localhost:3000/admin/products/[id]/edit` leads to 404
 */

const { test, expect } = require('@playwright/test');

test.describe('Admin Product Management', () => {
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

  test('should display product creation page without 404 error', async ({ page }) => {
    // Navigate to product creation page
    await page.goto('http://localhost:3001/admin/products/new');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the product creation page (not 404)
    await expect(page.locator('h1')).toContainText('Add New Product');
    await expect(page.locator('text=Create a new product for your catalog')).toBeVisible();
    
    // Verify the page is not showing 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=This page could not be found')).not.toBeVisible();
  });

  test('should display complete product creation form', async ({ page }) => {
    // Navigate to product creation page
    await page.goto('http://localhost:3001/admin/products/new');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify form fields are present
    await expect(page.getByRole('textbox', { name: 'Product Name *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: 'Price ($) *' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: 'Stock Quantity *' })).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible(); // Category dropdown
    
    // Verify buttons
    await expect(page.getByRole('button', { name: 'Create Product' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    
    // Verify navigation
    await expect(page.getByRole('link', { name: 'Back to Products' })).toBeVisible();
  });

  test('should display product edit page without 404 error', async ({ page }) => {
    // First go to products page to get a product ID
    await page.goto('http://localhost:3001/admin/products');
    await page.waitForLoadState('networkidle');
    
    // Find and click on the first edit button
    const editButton = page.locator('a[href*="/admin/products/"][href*="/edit"]').first();
    await editButton.click();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on an edit page (not 404)
    await expect(page.locator('h1')).toContainText('Edit Product');
    await expect(page.locator('text=Update product information')).toBeVisible();
    
    // Verify the page is not showing 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=This page could not be found')).not.toBeVisible();
  });

  test('should display complete product edit form with existing data', async ({ page }) => {
    // Navigate to a known product edit page (using T-Shirt product)
    await page.goto('http://localhost:3001/admin/products');
    await page.waitForLoadState('networkidle');
    
    // Find and click edit button for T-Shirt
    const editButton = page.locator('a[href*="/admin/products/"][href*="/edit"]').first();
    await editButton.click();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify form fields are present and populated
    const nameField = page.getByRole('textbox', { name: 'Product Name *' });
    await expect(nameField).toBeVisible();
    await expect(nameField).not.toHaveValue(''); // Should have existing product name
    
    const descriptionField = page.getByRole('textbox', { name: 'Description' });
    await expect(descriptionField).toBeVisible();
    
    const priceField = page.getByRole('spinbutton', { name: 'Price ($) *' });
    await expect(priceField).toBeVisible();
    await expect(priceField).not.toHaveValue(''); // Should have existing price
    
    const stockField = page.getByRole('spinbutton', { name: 'Stock Quantity *' });
    await expect(stockField).toBeVisible();
    await expect(stockField).not.toHaveValue(''); // Should have existing stock
    
    // Verify category dropdown
    await expect(page.getByRole('combobox')).toBeVisible();
    
    // Verify active/inactive switch
    await expect(page.locator('text=Product is active')).toBeVisible();
    
    // Verify buttons
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should have working navigation between product pages', async ({ page }) => {
    // Start from products list
    await page.goto('http://localhost:3001/admin/products');
    await page.waitForLoadState('networkidle');
    
    // Click "Add Product" button
    await page.getByRole('link', { name: 'Add Product' }).click();
    
    // Verify we're on the create page
    await expect(page).toHaveURL(/\/admin\/products\/new$/);
    await expect(page.locator('h1')).toContainText('Add New Product');
    
    // Click "Back to Products"
    await page.getByRole('link', { name: 'Back to Products' }).click();
    
    // Verify we're back on the products list
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.locator('h1')).toContainText('Product Management');
    
    // Click edit on first product
    const editButton = page.locator('a[href*="/admin/products/"][href*="/edit"]').first();
    await editButton.click();
    
    // Verify we're on edit page
    await expect(page.locator('h1')).toContainText('Edit Product');
    
    // Click "Back to Products"
    await page.getByRole('link', { name: 'Back to Products' }).click();
    
    // Verify we're back on the products list
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.locator('h1')).toContainText('Product Management');
  });

  test('should load categories in dropdown', async ({ page }) => {
    // Navigate to product creation page
    await page.goto('http://localhost:3001/admin/products/new');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on category dropdown
    await page.getByRole('combobox').click();
    
    // Verify categories are loaded
    await expect(page.getByRole('option', { name: 'No Category' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Electronics' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Clothing' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Home & Garden' })).toBeVisible();
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