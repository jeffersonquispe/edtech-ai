import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/instructor.json' });

test('Instructor: crear curso (simple)', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);

  const uniqueTitle = `Curso Test Simplificado ${Date.now()}`;
  await page.getByTestId('course-title-input').fill(uniqueTitle);
  await page.getByTestId('course-description-input').fill('Test description');

  const categorySelect = page.getByTestId('course-category-select');
  const firstCategoryValue = await categorySelect.locator('option').nth(0).getAttribute('value');
  if (firstCategoryValue) await categorySelect.selectOption(firstCategoryValue);

  await page.getByTestId('course-price-input').fill('29.99');

  await page.getByTestId('create-course-button').click();
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(uniqueTitle).first()).toBeVisible({ timeout: 10000 });
});
