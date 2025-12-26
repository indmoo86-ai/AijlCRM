#!/usr/bin/env node

/**
 * 调试测试 - 逐步测试每个功能
 */

const { chromium } = require('playwright');

async function main() {
  console.log('🔍 CRM系统调试测试\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // 测试1: 访问登录页
    console.log('1️⃣  访问登录页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    console.log('   ✓ 页面加载完成');
    console.log('   URL:', page.url());

    // 等待用户观察
    await page.waitForTimeout(2000);

    // 查找页面元素
    console.log('\n2️⃣  查找登录表单元素...');

    const usernameInput = page.locator('input').first();
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button').first();

    console.log('   用户名输入框数量:', await page.locator('input:not([type="password"])').count());
    console.log('   密码输入框数量:', await page.locator('input[type="password"]').count());
    console.log('   按钮数量:', await page.locator('button').count());

    // 填写表单
    console.log('\n3️⃣  填写登录信息...');
    await usernameInput.fill('admin');
    console.log('   ✓ 填写用户名');

    await passwordInput.fill('123456');
    console.log('   ✓ 填写密码');

    await page.waitForTimeout(1000);

    // 点击登录
    console.log('\n4️⃣  点击登录...');
    await submitButton.click();
    console.log('   ✓ 已点击登录按钮');

    // 等待跳转
    await page.waitForTimeout(3000);
    console.log('   当前URL:', page.url());

    if (page.url().includes('/dashboard') || page.url().endsWith('/')) {
      console.log('   ✅ 登录成功！');

      // 测试导航到线索管理
      console.log('\n5️⃣  测试导航到线索管理...');

      // 直接使用路由跳转
      await page.goto('http://localhost:5173/leads');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('   当前URL:', page.url());
      console.log('   ✓ 已进入线索管理页面');

      // 查找新建按钮
      console.log('\n6️⃣  查找新建按钮...');
      const buttons = await page.locator('button').all();
      console.log(`   找到 ${buttons.length} 个按钮`);

      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent();
        console.log(`   按钮${i + 1}: "${text}"`);
      }

    } else {
      console.log('   ❌ 登录失败');
    }

    console.log('\n💡 测试完成，浏览器将在10秒后关闭...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
    console.log('   已保存错误截图: debug-error.png');
  } finally {
    await browser.close();
  }
}

main();
