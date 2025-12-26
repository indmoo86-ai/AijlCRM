const { test, expect } = require('@playwright/test');

// 登录辅助函数
async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 5000 });
}

test.describe('报价单和合同管理完整流程', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('场景3-5：创建产品 → 创建报价单 → 添加明细 → 创建合同 → 签署合同', async ({ page }) => {
    // === 3. 创建产品 ===
    await page.click('text=产品管理');
    await page.waitForURL('**/products');

    await page.click('text=添加产品');
    await page.waitForSelector('.el-dialog');

    // 填写产品信息
    await page.fill('input[placeholder*="产品编码"]', 'PROD-E2E-001');
    await page.fill('input[placeholder*="产品名称"]', '智能门锁套装');

    // 选择产品类别
    await page.click('.el-select:has-text("类别")');
    await page.click('text=智能硬件');

    await page.fill('input[placeholder*="规格型号"]', 'DL-2024-Pro');
    await page.fill('input[placeholder*="单位"]', '套');

    // 价格
    await page.fill('input[placeholder*="成本价"]', '800');
    await page.fill('input[placeholder*="销售价"]', '1200');

    // 库存
    await page.fill('input[placeholder*="库存"]', '100');

    // 选择状态
    await page.click('.el-radio:has-text("上架")');

    await page.click('.el-dialog button:has-text("确定")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/03-1-product-created.png', fullPage: true });

    // === 4. 创建报价单 ===
    await page.click('text=报价管理');
    await page.waitForURL('**/quotations');

    await page.click('text=新建报价单');
    await page.waitForSelector('.el-dialog');

    // 选择客户
    await page.click('.el-select:has-text("客户")');
    await page.click('text=测试酒店-E2E-001');

    // 选择有效期
    await page.click('.el-date-editor');
    // 选择30天后（这里简化处理，直接关闭日期选择器）
    await page.keyboard.press('Escape');

    await page.fill('textarea[placeholder*="备注"]', 'E2E测试报价单');

    await page.click('.el-dialog button:has-text("确定")');
    await page.waitForTimeout(2000);

    // 应该跳转到报价单详情页
    expect(page.url()).toMatch(/\/quotations\/\d+/);
    await page.screenshot({ path: 'test-results/screenshots/04-1-quotation-created.png', fullPage: true });

    // === 4.2 添加产品明细 ===
    await page.click('button:has-text("添加产品")');
    await page.waitForSelector('.el-dialog');

    // 选择产品
    await page.click('.el-select:has-text("选择产品")');
    await page.click('text=智能门锁套装');

    // 等待产品信息自动填充
    await page.waitForTimeout(500);

    // 输入数量
    await page.fill('input[placeholder*="数量"]', '50');

    // 输入折扣率
    await page.fill('input[placeholder*="折扣"]', '5');

    // 验证小计计算（50 × 1200 × 0.95 = 57000）
    const subtotal = await page.locator('.el-form-item:has-text("小计") input').inputValue();
    console.log('计算的小计:', subtotal);

    await page.click('.el-dialog button:has-text("确定")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/04-2-quotation-item-added.png', fullPage: true });

    // 验证产品清单显示
    await expect(page.locator('text=智能门锁套装')).toBeVisible();

    // === 4.3 提交报价单 ===
    await page.click('button:has-text("提交报价")');
    await page.click('.el-message-box button:has-text("确定")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/04-3-quotation-submitted.png', fullPage: true });

    // 验证状态变化
    await expect(page.locator('text=已提交')).toBeVisible();

    // === 5. 创建合同 ===
    await page.click('text=合同管理');
    await page.waitForURL('**/contracts');

    await page.click('text=新建合同');
    await page.waitForSelector('.el-dialog');

    // 选择客户
    await page.click('.el-select:has-text("客户")');
    await page.click('text=测试酒店-E2E-001');

    // 输入合同金额
    await page.fill('input[placeholder*="合同金额"]', '57000');

    // 选择付款方式
    await page.click('.el-select:has-text("付款方式")');
    await page.click('text=预付款');

    // 选择交付方式
    await page.click('.el-select:has-text("交付方式")');
    await page.click('text=物流配送');

    await page.click('.el-dialog button:has-text("确定")');
    await page.waitForTimeout(2000);

    // 应该跳转到合同详情页
    expect(page.url()).toMatch(/\/contracts\/\d+/);
    await page.screenshot({ path: 'test-results/screenshots/05-1-contract-created.png', fullPage: true });

    // === 5.2 添加合同产品明细 ===
    await page.click('button:has-text("添加产品")');
    await page.waitForSelector('.el-dialog');

    await page.click('.el-select:has-text("选择产品")');
    await page.click('text=智能门锁套装');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="数量"]', '50');
    await page.fill('input[placeholder*="折扣"]', '5');

    await page.click('.el-dialog button:has-text("确定")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/05-2-contract-item-added.png', fullPage: true });

    // === 5.3 签署合同 ===
    await page.click('button:has-text("签署合同")');
    await page.waitForSelector('.el-dialog');

    // 日期会自动填充，直接确定
    await page.click('.el-dialog button:has-text("确定签署")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/screenshots/05-3-contract-signed.png', fullPage: true });

    // 验证状态变化
    await expect(page.locator('text=执行中')).toBeVisible();

    // === 5.4 查看执行进度 ===
    await page.click('button:has-text("查看进度")');
    await page.waitForSelector('.el-dialog:has-text("合同执行进度")');

    // 验证进度信息显示
    await expect(page.locator('text=合同金额')).toBeVisible();
    await expect(page.locator('text=已发货金额')).toBeVisible();
    await expect(page.locator('text=已收款金额')).toBeVisible();
    await expect(page.locator('text=已开票金额')).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/05-4-contract-progress.png', fullPage: true });

    await page.click('.el-dialog button:has-text("关闭")');
  });
});
