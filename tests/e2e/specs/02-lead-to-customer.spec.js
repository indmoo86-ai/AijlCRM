const { test, expect } = require('@playwright/test');

// 登录辅助函数
async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 5000 });
}

test.describe('线索管理完整流程', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('场景2：创建线索 → 跟进 → 转客户', async ({ page }) => {
    // 2.1 导航到线索管理页面
    await page.click('text=线索管理');
    await page.waitForURL('**/leads');
    await page.screenshot({ path: 'test-results/screenshots/02-1-leads-page.png', fullPage: true });

    // 2.2 创建线索
    await page.click('text=添加线索');
    await page.waitForSelector('.el-dialog');

    // 填写线索表单
    await page.fill('input[placeholder*="线索名称"]', '测试酒店-E2E-001');
    await page.fill('input[placeholder*="联系人"]', '张经理');
    await page.fill('input[placeholder*="手机"]', '13800138001');

    // 选择来源（假设是下拉选择）
    await page.click('.el-select:has-text("来源")');
    await page.click('text=网络推广');

    // 点击确定
    await page.click('.el-dialog button:has-text("确定")');

    // 等待对话框关闭
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/02-2-lead-created.png', fullPage: true });

    // 验证线索创建成功
    await expect(page.locator('text=测试酒店-E2E-001')).toBeVisible();

    // 2.3 跟进线索
    // 找到刚创建的线索行，点击跟进按钮
    const leadRow = page.locator('tr:has-text("测试酒店-E2E-001")');
    await leadRow.locator('button:has-text("跟进")').click();
    await page.waitForSelector('.el-dialog');

    // 填写跟进内容
    await page.fill('textarea[placeholder*="跟进内容"]', '初次电话沟通，客户有意向');

    // 选择下次联系时间（假设是日期选择器）
    await page.click('.el-date-editor');
    await page.click('.el-picker-panel__footer button:has-text("今天")');

    // 提交跟进
    await page.click('.el-dialog button:has-text("确定")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/02-3-lead-followed.png', fullPage: true });

    // 2.4 转为客户
    await leadRow.locator('button:has-text("转客户")').click();

    // 确认转换
    await page.click('.el-message-box button:has-text("确定")');
    await page.waitForTimeout(2000);

    // 验证跳转到客户页面
    expect(page.url()).toContain('/customers');
    await page.screenshot({ path: 'test-results/screenshots/02-4-converted-to-customer.png', fullPage: true });

    // 验证客户列表中存在该客户
    await expect(page.locator('text=测试酒店-E2E-001')).toBeVisible();
  });
});
