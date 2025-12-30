/**
 * 场景5.1: 创建报价单
 * 输入: 选择客户, 选择日期, 填写金额
 * 预期输出: 报价单列表显示新报价单
 */

const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test_5_1_create_quotation() {
  console.log('========================================');
  console.log('场景5.1: 创建报价单测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: 登录
    console.log('Step 1: 登录系统...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.fill('input:first-of-type', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('  登录成功');

    // Step 2: 导航到报价管理
    console.log('Step 2: 导航到报价管理...');
    await page.goto(`${BASE_URL}/quotations`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('  当前URL:', page.url());

    // 记录现有数据条数
    const initialRows = await page.$$('.el-table__body-wrapper .el-table__row');
    const initialCount = initialRows.length;
    console.log('  当前列表条数:', initialCount);

    // Step 3: 点击新建按钮
    console.log('Step 3: 点击新建按钮...');
    await page.click('button:has-text("新建报价单")');
    await page.waitForTimeout(1000);
    console.log('  新建对话框已打开');

    // Step 4: 填写报价单表单
    console.log('Step 4: 填写报价单表单...');
    await page.waitForSelector('.el-dialog__body', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 选择客户
    console.log('  选择客户...');
    await page.click('.el-dialog__body .el-select');
    await page.waitForTimeout(500);
    await page.click('.el-select-dropdown:visible .el-select-dropdown__item >> nth=0');
    console.log('  客户: 已选择');
    await page.waitForTimeout(500);

    // 点击报价日期输入框
    console.log('  选择报价日期...');
    const dateEditors = await page.$$('.el-dialog__body .el-date-editor');
    if (dateEditors.length >= 1) {
      await dateEditors[0].click();
      await page.waitForTimeout(500);

      // 点击今天的单元格
      const todayCell = await page.$('.el-picker-panel:visible .el-date-table td.today, .el-picker-panel:visible .el-date-table td.current');
      if (todayCell) {
        await todayCell.click();
        console.log('  报价日期: 已选择今天');
      } else {
        // 直接点击一个可用的日期
        await page.click('.el-picker-panel:visible .el-date-table td.available >> nth=15');
        console.log('  报价日期: 已选择');
      }
      await page.waitForTimeout(500);
    }

    // 点击有效期至输入框
    console.log('  选择有效期至...');
    if (dateEditors.length >= 2) {
      await dateEditors[1].click();
      await page.waitForTimeout(500);

      // 选择一个可用的日期（后面的日期）
      const cells = await page.$$('.el-picker-panel:visible .el-date-table td.available');
      if (cells.length > 25) {
        await cells[25].click();
        console.log('  有效期至: 已选择');
      } else if (cells.length > 0) {
        await cells[cells.length - 1].click();
        console.log('  有效期至: 已选择最后一个可用日期');
      }
      await page.waitForTimeout(500);
    }

    // 填写报价金额
    const amountInput = await page.$('.el-dialog__body .el-input-number input');
    if (amountInput) {
      await amountInput.click();
      await page.waitForTimeout(200);
      await amountInput.fill('');
      await amountInput.type('199900');
      console.log('  报价金额: 199900');
    }

    await page.waitForTimeout(500);

    // 截图1: 表单填写完成
    const screenshot1 = path.join(SCREENSHOT_DIR, '5.1-form-filled.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log('  截图已保存:', screenshot1);

    // Step 5: 点击确定按钮
    console.log('Step 5: 点击确定按钮...');
    await page.click('.el-dialog__footer button:has-text("确定")');
    console.log('  确定按钮已点击');

    await page.waitForTimeout(2000);

    // 检查成功消息
    const pageContent = await page.content();
    const hasSuccess = pageContent.includes('成功');
    if (hasSuccess) {
      console.log('  ✓ 检测到成功提示');
    }

    // 截图2: 保存结果
    const screenshot2 = path.join(SCREENSHOT_DIR, '5.1-success.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log('  截图已保存:', screenshot2);

    // Step 6: 验证列表
    console.log('Step 6: 验证报价单列表...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const finalRows = await page.$$('.el-table__body-wrapper .el-table__row');
    const finalCount = finalRows.length;
    console.log('  最终列表条数:', finalCount);

    const isNewAdded = finalCount > initialCount;

    // 截图3: 列表显示
    const screenshot3 = path.join(SCREENSHOT_DIR, '5.1-list-data.png');
    await page.screenshot({ path: screenshot3, fullPage: true });
    console.log('  截图已保存:', screenshot3);

    const testPassed = hasSuccess || isNewAdded;

    // 输出结果
    console.log('');
    console.log('========================================');
    console.log('测试结果:');
    console.log('========================================');
    console.log('场景: 5.1 创建报价单');
    console.log('成功提示:', hasSuccess ? '✓' : '✗');
    console.log('新增记录:', isNewAdded ? '✓' : '✗');
    console.log('状态:', testPassed ? '✓ 通过' : '✗ 失败');
    console.log('========================================');

    return testPassed;

  } catch (error) {
    console.error('测试执行错误:', error.message);
    const screenshotError = path.join(SCREENSHOT_DIR, '5.1-error.png');
    await page.screenshot({ path: screenshotError, fullPage: true }).catch(() => {});
    return false;
  } finally {
    await browser.close();
  }
}

test_5_1_create_quotation().then(success => {
  process.exit(success ? 0 : 1);
});
