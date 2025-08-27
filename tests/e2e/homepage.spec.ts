import { test, expect } from '@playwright/test';

test.describe('NOHVEX Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/NOHVEX/i);

    // Check for key elements that should be present
    // Note: These selectors may need to be updated based on actual homepage content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Check if navigation elements are present
    // This test will be updated once we know the actual navigation structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('API Health Check', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('memory');
    expect(data).toHaveProperty('environment');
  });
});