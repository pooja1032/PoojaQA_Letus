import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1920, height: 1080 } });

test('scrolls Shop by Category internal list', async ({ page }) => {
  await page.goto('https://www.bigbasket.com/');

  const trigger = page.locator("//span[text()='Shop by']//following::span[text()='Category'][2]");
  await trigger.click();

  const buttonEl = trigger.locator('xpath=ancestor::button[1]');
  const menuId = await buttonEl.getAttribute('aria-controls');
  console.log('menuId:', menuId);

  // FIX: use attribute selector — id contains ":" which breaks CSS #id syntax
  const menu = page.locator(`[id="${menuId}"]`);
  await menu.waitFor({ state: 'visible' });

  const categoryList = menu.locator('ul').first();
  await categoryList.waitFor({ state: 'visible' });

  await categoryList.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'after-scroll.png' });

  const state = await categoryList.evaluate((el) => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  }));
  console.log('Scroll state:', state);

  const reachedEnd = state.scrollTop + state.clientHeight >= state.scrollHeight - 1;
  expect(reachedEnd).toBeTruthy();

  const lastItem = categoryList.locator('li').last();
  await expect(lastItem).toBeInViewport();
 
});