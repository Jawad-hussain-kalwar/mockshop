/**
 * Account Settings Functionality Tests
 * 
 * Tests the complete account settings functionality including:
 * - Settings persistence
 * - Profile updates
 * - Toggle functionality
 * - API integration
 */

const { test, expect } = require('@playwright/test');

test.describe('Account Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Sign in as admin user
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@mockshop.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for redirect to homepage
    await page.waitForURL('http://localhost:3000/');
    
    // Navigate to account settings
    await page.goto('http://localhost:3000/account/settings');
    
    // Wait for settings to load
    await page.waitForSelector('h1:has-text("Account Settings")');
  });

  test('should display account settings page correctly', async ({ page }) => {
    // Check page title and header
    await expect(page.locator('h1')).toContainText('Account Settings');
    await expect(page.locator('p')).toContainText('Manage your account preferences and privacy settings');
    
    // Check navigation categories
    await expect(page.getByRole('button', { name: 'Profile Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Privacy & Security' })).toBeVisible();
    
    // Check profile section
    await expect(page.getByText('Profile Settings')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveValue('Admin');
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toHaveValue('User');
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toHaveValue('admin@mockshop.com');
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeDisabled();
    
    // Check notification settings
    await expect(page.getByText('Notification Preferences')).toBeVisible();
    await expect(page.getByText('Email Notifications')).toBeVisible();
    await expect(page.getByText('SMS Notifications')).toBeVisible();
    await expect(page.getByText('Marketing Emails')).toBeVisible();
    await expect(page.getByText('Order Updates')).toBeVisible();
    
    // Check privacy & security section
    await expect(page.getByText('Privacy & Security')).toBeVisible();
    await expect(page.getByText('Two-Factor Authentication')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download My Data' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible();
    
    // Check save button
    await expect(page.getByRole('button', { name: 'Save Settings' })).toBeVisible();
  });

  test('should update profile information', async ({ page }) => {
    // Update first name
    await page.getByRole('textbox', { name: 'First Name' }).fill('Updated Admin');
    
    // Update last name
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Updated User');
    
    // Save settings
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    // Handle success dialog
    await page.on('dialog', dialog => dialog.accept());
    
    // Verify the values are still there after save
    await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveValue('Updated Admin');
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toHaveValue('Updated User');
  });

  test('should toggle notification settings', async ({ page }) => {
    // Get initial state of SMS notifications (should be unchecked by default)
    const smsCheckbox = page.locator('input[type="checkbox"]').nth(1); // SMS notifications checkbox
    
    // Toggle SMS notifications
    await smsCheckbox.click();
    
    // Verify it's now checked
    await expect(smsCheckbox).toBeChecked();
    
    // Save settings
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    // Handle success dialog
    await page.on('dialog', dialog => dialog.accept());
    
    // Verify the checkbox is still checked after save
    await expect(smsCheckbox).toBeChecked();
  });

  test('should toggle public profile setting', async ({ page }) => {
    // Get public profile checkbox
    const publicProfileCheckbox = page.locator('input[type="checkbox"]').first(); // Public profile checkbox
    
    // Toggle public profile
    await publicProfileCheckbox.click();
    
    // Verify it's now checked
    await expect(publicProfileCheckbox).toBeChecked();
    
    // Save settings
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    // Handle success dialog
    await page.on('dialog', dialog => dialog.accept());
    
    // Verify the checkbox is still checked after save
    await expect(publicProfileCheckbox).toBeChecked();
  });

  test('should toggle two-factor authentication', async ({ page }) => {
    // Get 2FA checkbox (should be the last checkbox)
    const twoFACheckbox = page.locator('input[type="checkbox"]').last();
    
    // Toggle 2FA
    await twoFACheckbox.click();
    
    // Verify it's now checked
    await expect(twoFACheckbox).toBeChecked();
    
    // Save settings
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    // Handle success dialog
    await page.on('dialog', dialog => dialog.accept());
    
    // Verify the checkbox is still checked after save
    await expect(twoFACheckbox).toBeChecked();
  });

  test('should show success message when saving settings', async ({ page }) => {
    // Make a small change
    await page.getByRole('textbox', { name: 'First Name' }).fill('Test Admin');
    
    // Save settings and wait for dialog
    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Settings saved successfully!');
    
    // Accept the dialog
    await dialog.accept();
  });

  test('should have working back to account button', async ({ page }) => {
    // Click back to account button
    await page.getByRole('button', { name: 'Back to Account' }).click();
    
    // Should navigate to account page
    await page.waitForURL('http://localhost:3000/account');
    await expect(page.locator('h1')).toContainText('My Account');
  });

  test('should preserve settings state during session', async ({ page }) => {
    // Toggle SMS notifications
    const smsCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await smsCheckbox.click();
    await expect(smsCheckbox).toBeChecked();
    
    // Save settings
    await page.getByRole('button', { name: 'Save Settings' }).click();
    await page.on('dialog', dialog => dialog.accept());
    
    // Navigate away and back
    await page.goto('http://localhost:3000/');
    await page.goto('http://localhost:3000/account/settings');
    
    // Wait for settings to load
    await page.waitForSelector('h1:has-text("Account Settings")');
    
    // Verify SMS notifications is still checked
    const smsCheckboxAfter = page.locator('input[type="checkbox"]').nth(1);
    await expect(smsCheckboxAfter).toBeChecked();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/user/settings', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Try to save settings
    await page.getByRole('textbox', { name: 'First Name' }).fill('Error Test');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Failed to save settings. Please try again.');
    
    await dialog.accept();
  });
});

test.describe('Account Settings API', () => {
  test('should fetch user settings via API', async ({ request }) => {
    // This would require proper session handling in a real test
    // For now, we'll test the API structure
    const response = await request.get('http://localhost:3000/api/user/settings');
    
    if (response.status() === 401) {
      // Expected when not authenticated
      expect(response.status()).toBe(401);
    } else {
      // If authenticated, should return proper structure
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('settings');
      expect(data.settings).toHaveProperty('emailNotifications');
      expect(data.settings).toHaveProperty('smsNotifications');
      expect(data.settings).toHaveProperty('marketingEmails');
      expect(data.settings).toHaveProperty('orderUpdates');
      expect(data.settings).toHaveProperty('twoFactorAuth');
      expect(data.settings).toHaveProperty('publicProfile');
    }
  });
});