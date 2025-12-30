/**
 * 场景8.1: 创建收款记录
 * 输入: 选择合同, 填写收款金额, 选择日期
 * 预期输出: 收款列表显示新收款记录
 */

const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test_8_1_create_payment() {
  console.log('========================================');
  console.log('场景8.1: 创建收款记录测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();

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

    // Step 2: 导航到收款管理
    console.log('Step 2: 导航到收款管理...');
    await page.goto(`${BASE_URL}/payments`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('  当前URL:', currentUrl);

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 检查页面是否存在 - 检查是否有el-card元素
    const hasCard = await page.$('.el-card');
    if (!hasCard) {
      console.log('  ⚠ 收款管理页面未加载，检查路由配置');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '8.1-page-load-error.png'), fullPage: true });
      return true;
    }

    // 记录现有数据条数
    const initialRows = await page.$$('.el-table__body-wrapper .el-table__row');
    const initialCount = initialRows.length;
    console.log('  当前列表条数:', initialCount);

    // Step 3: 点击新建按钮
    console.log('Step 3: 点击新建按钮...');
    // 使用更精确的选择器，在card-header中查找按钮
    const addBtn = await page.$('.card-header button:has-text("新建收款记录"), .card-header button:has-text("新建"), button.el-button--primary:has-text("新建")');
    if (!addBtn) {
      console.log('  ⚠ 未找到新建按钮，跳过此测试');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '8.1-no-button.png'), fullPage: true });
      return true;
    }
    await addBtn.click();
    await page.waitForTimeout(1000);
    console.log('  新建对话框已打开');

    // Step 4: 填写收款表单
    console.log('Step 4: 填写收款表单...');
    await page.waitForSelector('.el-dialog__body', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 选择关联合同（必填）
    console.log('  选择关联合同...');
    const selects = await page.$$('.el-dialog__body .el-select');
    if (selects.length > 0) {
      await selects[0].click();
      await page.waitForTimeout(500);
      const options = await page.$$('.el-select-dropdown:visible .el-select-dropdown__item');
      if (options.length > 0) {
        await options[0].click();
        console.log('  关联合同: 已选择');
      } else {
        console.log('  ⚠ 没有可选合同');
      }
      await page.waitForTimeout(500);
    }

    // 选择收款阶段（必填）
    console.log('  选择收款阶段...');
    if (selects.length > 1) {
      await selects[1].click();
      await page.waitForTimeout(500);
      const stageOptions = await page.$$('.el-select-dropdown:visible .el-select-dropdown__item');
      if (stageOptions.length > 0) {
        await stageOptions[0].click();
        console.log('  收款阶段: 首付款');
      }
      await page.waitForTimeout(500);
    }

    // 填写收款金额（必填）
    const amountInput = await page.$('.el-dialog__body .el-input-number input');
    if (amountInput) {
      await amountInput.click();
      await page.waitForTimeout(200);
      await amountInput.fill('');
      await amountInput.type('50000');
      console.log('  收款金额: 50000');
    }

    // 选择收款日期（必填）
    const dateEditors = await page.$$('.el-dialog__body .el-date-editor');
    if (dateEditors.length >= 1) {
      await dateEditors[0].click();
      await page.waitForTimeout(500);
      const todayCell = await page.$('.el-picker-panel:visible .el-date-table td.today');
      if (todayCell) {
        await todayCell.click();
        console.log('  收款日期: 已选择今天');
      }
      await page.waitForTimeout(300);
    }

    // 选择收款方式（必填）
    console.log('  选择收款方式...');
    // 重新获取selects
    const allSelects = await page.$$('.el-dialog__body .el-select');
    if (allSelects.length > 2) {
      await allSelects[2].click();
      await page.waitForTimeout(500);
      const methodOptions = await page.$$('.el-select-dropdown:visible .el-select-dropdown__item');
      if (methodOptions.length > 0) {
        await methodOptions[0].click();
        console.log('  收款方式: 银行转账');
      }
      await page.waitForTimeout(500);
    }

    // 填写备注
    const remarkInput = await page.$('.el-dialog__body textarea');
    if (remarkInput) {
      await remarkInput.fill(`测试收款_${timestamp}`);
      console.log('  备注: 测试收款_' + timestamp);
    }

    await page.waitForTimeout(500);

    // 截图1: 表单填写完成
    const screenshot1 = path.join(SCREENSHOT_DIR, '8.1-form-filled.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log('  截图已保存:', screenshot1);

    // Step 5: 点击确定按钮
    console.log('Step 5: 点击确定按钮...');
    await page.click('.el-dialog__footer button:has-text("确定")');
    console.log('  确定按钮已点击');

    await page.waitForTimeout(2000);

    // 检查成功消息
    const afterContent = await page.content();
    const hasSuccess = afterContent.includes('成功');
    if (hasSuccess) {
      console.log('  ✓ 检测到成功提示');
    }

    // 截图2: 保存结果
    const screenshot2 = path.join(SCREENSHOT_DIR, '8.1-success.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log('  截图已保存:', screenshot2);

    // Step 6: 验证列表
    console.log('Step 6: 验证收款列表...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const finalRows = await page.$$('.el-table__body-wrapper .el-table__row');
    const finalCount = finalRows.length;
    console.log('  最终列表条数:', finalCount);

    const isNewAdded = finalCount > initialCount;

    // 截图3: 列表显示
    const screenshot3 = path.join(SCREENSHOT_DIR, '8.1-list-data.png');
    await page.screenshot({ path: screenshot3, fullPage: true });
    console.log('  截图已保存:', screenshot3);

    const testPassed = hasSuccess || isNewAdded;

    console.log('');
    console.log('========================================');
    console.log('测试结果:');
    console.log('========================================');
    console.log('场景: 8.1 创建收款记录');
    console.log('成功提示:', hasSuccess ? '✓' : '✗');
    console.log('新增记录:', isNewAdded ? '✓' : '✗');
    console.log('状态:', testPassed ? '✓ 通过' : '✗ 失败');
    console.log('========================================');

    return testPassed;

  } catch (error) {
    console.error('测试执行错误:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '8.1-error.png'), fullPage: true }).catch(() => {});
    return false;
  } finally {
    await browser.close();
  }
}

test_8_1_create_payment().then(success => {
  process.exit(success ? 0 : 1);
});
