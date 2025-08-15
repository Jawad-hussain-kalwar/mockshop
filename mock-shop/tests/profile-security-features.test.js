/**
 * Profile Security Features Tests
 * 
 * Tests the complete profile security functionality including:
 * - Change Password
 * - Download My Data
 * - Delete Account
 * - Form validation and security
 */

const { test, expect } = require('@playwright/test');

test.describe('Profile Security Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and sign in
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@mockshop.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for redirect and navigate to settings
    await page.waitForURL('http://localhost:3000/');
    await page.goto('http://localhost:3000/account/settings');
    await page.waitForSelector('h1:has-text("Account Settings")');
  });

  test('should display security action buttons', async ({ page }) => {
    // Check that all security buttons are present
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download My Data' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible();
  });

  test('should open change password modal', async ({ page }) => {
    // Click change password button
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Check that modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Change Password')).toBeVisible();
    
    // Check form fields
    await expect(page.getByRole('textbox', { name: 'Current Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'New Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm New Password' })).toBeVisible();
    
    // Check buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();
  });

  test('should validate password change form', async ({ page }) => {
    // Open change password modal
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Try to submit with mismatched passwords
    await page.getByRole('textbox', { name: 'Current Password' }).fill('password123');
    await page.getByRole('textbox', { name: 'New Password' }).fill('newpassword123');
    await page.getByRole('textbox', { name: 'Confirm New Password' }).fill('differentpassword');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('New passwords do not match');
    await dialog.accept();
  });

  test('should validate minimum password length', async ({ page }) => {
    // Open change password modal
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Try to submit with short password
    await page.getByRole('textbox', { name: 'Current Password' }).fill('password123');
    await page.getByRole('textbox', { name: 'New Password' }).fill('short');
    await page.getByRole('textbox', { name: 'Confirm New Password' }).fill('short');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Password must be at least 8 characters long');
    await dialog.accept();
  });

  test('should close change password modal on cancel', async ({ page }) => {
    // Open change password modal
    await page.getByRole('button', { name: 'Change Password' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Modal should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should handle download my data functionality', async ({ page }) => {
    // Set up download handling
    const downloadPromise = page.waitForEvent('download');
    
    // Click download button
    await page.getByRole('button', { name: 'Download My Data' }).click();
    
    // Wait for download or alert (depending on implementation)
    try {
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/user-data-\d{4}-\d{2}-\d{2}\.json/);
    } catch (error) {
      // If download doesn't work, check for alert
      const dialogPromise = page.waitForEvent('dialog');
      const dialog = await dialogPromise;
      expect(dialog.message()).toContain('data');
      await dialog.accept();
    }
  });

  test('should open delete account modal', async ({ page }) => {
    // Click delete account button
    await page.getByRole('button', { name: 'Delete Account' }).click();
    
    // Check that modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Delete Account')).toBeVisible();
    
    // Check warning text
    await expect(page.getByText('Warning: This action cannot be undone!')).toBeVisible();
    await expect(page.getByText('Your profile information')).toBeVisible();
    await expect(page.getByText('Order history')).toBeVisible();
    
    // Check form fields
    await expect(page.getByRole('textbox', { name: /Type "DELETE" to confirm/ })).toBeVisible();
    
    // Check buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeDisabled();
  });

  test('should validate delete account confirmation', async ({ page }) => {
    // Open delete account modal
    await page.getByRole('button', { name: 'Delete Account' }).click();
    
    // Type incorrect confirmation text
    await page.getByRole('textbox', { name: /Type "DELETE" to confirm/ }).fill('delete');
    
    // Button should still be disabled
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeDisabled();
    
    // Type correct confirmation text
    await page.getByRole('textbox', { name: /Type "DELETE" to confirm/ }).fill('DELETE');
    
    // Button should now be enabled
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeEnabled();
  });

  test('should close delete account modal on cancel', async ({ page }) => {
    // Open delete account modal
    await page.getByRole('button', { name: 'Delete Account' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Modal should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure for change password
    await page.route('**/api/user/change-password', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Current password is incorrect' })
      });
    });
    
    // Open change password modal and submit
    await page.getByRole('button', { name: 'Change Password' }).click();
    await page.getByRole('textbox', { name: 'Current Password' }).fill('wrongpassword');
    await page.getByRole('textbox', { name: 'New Password' }).fill('newpassword123');
    await page.getByRole('textbox', { name: 'Confirm New Password' }).fill('newpassword123');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Failed to change password. Please try again.');
    await dialog.accept();
  });
});

test.describe('Profile Security API', () => {
  test('should validate change password API structure', async ({ request }) => {
    // Test the API endpoint structure (would need proper authentication in real test)
    const response = await request.put('http://localhost:3000/api/user/change-password', {
      data: {
        currentPassword: 'test',
        newPassword: 'test123456'
      }
    });
    
    // Should return 401 when not authenticated
    expect(response.status()).toBe(401);
  });

  test('should validate data export API structure', async ({ request }) => {
    // Test the API endpoint structure
    const response = await request.get('http://localhost:3000/api/user/data-export');
    
    // Should return 401 when not authenticated
    expect(response.status()).toBe(401);
  });

  test('should validate delete account API structure', async ({ request }) => {
    // Test the API endpoint structure
    const response = await request.delete('http://localhost:3000/api/user/delete-account');
    
    // Should return 401 when not authenticated
    expect(response.status()).toBe(401);
  });
});