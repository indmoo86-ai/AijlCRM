const { test, expect } = require('@playwright/test');

test.describe('用户登录流程', () => {
  test('应该能够成功登录系统', async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');

    // 验证登录页面元素
    await expect(page).toHaveTitle(/CRM/i);

    // 输入用户名
    await page.fill('input[type="text"]', 'admin');

    // 输入密码
    await page.fill('input[type="password"]', '123456');

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待跳转到工作台
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // 验证成功跳转
    expect(page.url()).toContain('/dashboard');

    // 截图
    await page.screenshot({ path: 'test-results/screenshots/login-success.png', fullPage: true });
  });

  test('应该拒绝错误的登录凭证', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="text"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // 等待错误消息
    await page.waitForTimeout(1000);

    // 验证仍在登录页面
    expect(page.url()).toContain('/login');

    // 截图
    await page.screenshot({ path: 'test-results/screenshots/login-failed.png' });
  });
});
