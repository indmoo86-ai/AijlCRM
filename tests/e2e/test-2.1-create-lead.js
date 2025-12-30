/**
 * 场景2.1: 创建线索
 * 输入: 客户名称测试客户A, 酒店名称测试酒店A, 房间数200, 联系电话13900139000
 * 预期输出: 线索列表显示新线索，数据库leads表有记录
 */

const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test_2_1_create_lead() {
  console.log('========================================');
  console.log('场景2.1: 创建线索测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();
  const customerName = `测试客户A_${timestamp}`;
  const hotelName = `测试酒店A_${timestamp}`;

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

    // Step 2: 导航到线索管理
    console.log('Step 2: 导航到线索管理...');
    await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('  当前URL:', page.url());

    // Step 3: 点击新建按钮
    console.log('Step 3: 点击新建按钮...');
    await page.click('button:has-text("新建线索")');
    await page.waitForTimeout(1000);
    console.log('  新建对话框已打开');

    // Step 4: 填写线索表单
    console.log('Step 4: 填写线索表单...');
    await page.waitForSelector('.el-dialog__body', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 填写客户名称
    const custNameInput = await page.$('.el-dialog__body input[placeholder*="客户名称"]');
    if (custNameInput) {
      await custNameInput.fill(customerName);
      console.log('  客户名称:', customerName);
    }

    // 填写酒店名称
    const hotelNameInput = await page.$('.el-dialog__body input[placeholder*="酒店名称"]');
    if (hotelNameInput) {
      await hotelNameInput.fill(hotelName);
      console.log('  酒店名称:', hotelName);
    }

    // 填写联系电话
    const phoneInput = await page.$('.el-dialog__body input[placeholder*="电话"]');
    if (phoneInput) {
      await phoneInput.fill('13900139000');
      console.log('  联系电话: 13900139000');
    }

    // 填写房间数
    const roomInput = await page.$('.el-dialog__body .el-form-item:has-text("房间") input');
    if (roomInput) {
      await roomInput.click();
      await roomInput.fill('200');
      console.log('  房间数: 200');
    }

    // 选择来源渠道
    console.log('  选择来源渠道...');
    const sourceSelect = await page.$('.el-dialog__body .el-form-item:has-text("来源") .el-select');
    if (sourceSelect) {
      await sourceSelect.click();
      await page.waitForTimeout(500);
      await page.click('.el-select-dropdown:visible .el-select-dropdown__item >> nth=0');
      console.log('  来源渠道: 已选择');
      await page.waitForTimeout(300);
    }

    // 选择意向程度
    console.log('  选择意向程度...');
    const intentSelect = await page.$('.el-dialog__body .el-form-item:has-text("意向") .el-select');
    if (intentSelect) {
      await intentSelect.click();
      await page.waitForTimeout(500);
      await page.click('.el-select-dropdown:visible .el-select-dropdown__item >> nth=0');
      console.log('  意向程度: 已选择');
      await page.waitForTimeout(300);
    }

    // 填写省份
    const provinceInput = await page.$('.el-dialog__body input[placeholder*="省份"]');
    if (provinceInput) {
      await provinceInput.fill('广东省');
      console.log('  省份: 广东省');
    }

    // 填写城市
    const cityInput = await page.$('.el-dialog__body input[placeholder*="城市"]');
    if (cityInput) {
      await cityInput.fill('深圳市');
      console.log('  城市: 深圳市');
    }

    await page.waitForTimeout(500);

    // 截图1: 表单填写完成
    const screenshot1 = path.join(SCREENSHOT_DIR, '2.1-form-filled.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log('  截图已保存:', screenshot1);

    // Step 5: 点击确定按钮
    console.log('Step 5: 点击确定按钮...');
    await page.click('.el-dialog__footer button:has-text("确定")');
    console.log('  确定按钮已点击');

    await page.waitForTimeout(2000);

    // 检查成功消息
    const pageContent = await page.content();
    if (pageContent.includes('成功')) {
      console.log('  ✓ 检测到成功提示');
    }

    // 截图2: 保存结果
    const screenshot2 = path.join(SCREENSHOT_DIR, '2.1-success.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log('  截图已保存:', screenshot2);

    // Step 6: 验证列表
    console.log('Step 6: 验证线索列表...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const finalContent = await page.content();
    const leadFound = finalContent.includes(customerName.substring(0, 10)) || finalContent.includes(hotelName.substring(0, 10));

    // 截图3: 列表显示
    const screenshot3 = path.join(SCREENSHOT_DIR, '2.1-list-data.png');
    await page.screenshot({ path: screenshot3, fullPage: true });
    console.log('  截图已保存:', screenshot3);

    if (leadFound) {
      console.log('  ✓ 线索在列表中找到');
    } else {
      console.log('  ⚠ 未在列表中找到线索');
    }

    // 输出结果
    console.log('');
    console.log('========================================');
    console.log('测试结果:');
    console.log('========================================');
    console.log('场景: 2.1 创建线索');
    console.log('输入数据:');
    console.log('  客户名称:', customerName);
    console.log('  酒店名称:', hotelName);
    console.log('  联系电话: 13900139000');
    console.log('  房间数: 200');
    console.log('列表验证:', leadFound ? '✓ 通过' : '✗ 失败');
    console.log('========================================');

    return leadFound;

  } catch (error) {
    console.error('测试执行错误:', error.message);
    const screenshotError = path.join(SCREENSHOT_DIR, '2.1-error.png');
    await page.screenshot({ path: screenshotError, fullPage: true }).catch(() => {});
    return false;
  } finally {
    await browser.close();
  }
}

test_2_1_create_lead().then(success => {
  process.exit(success ? 0 : 1);
});
