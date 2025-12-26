#!/usr/bin/env node

/**
 * 测试登录跳转修复
 */

const { chromium } = require('playwright');

async function testLogin() {
  console.log('🧪 测试登录跳转修复\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // 1. 访问首页
    console.log('1️⃣  访问首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    console.log('   当前URL:', page.url());

    // 2. 填写登录表单
    console.log('\n2️⃣  填写登录表单...');
    await page.fill('input:not([type="password"])', 'admin');
    console.log('   ✓ 填写用户名: admin');

    await page.fill('input[type="password"]', '123456');
    console.log('   ✓ 填写密码');

    await page.waitForTimeout(1000);

    // 3. 点击登录
    console.log('\n3️⃣  点击登录按钮...');
    await page.click('button');
    console.log('   ✓ 已点击');

    // 4. 等待跳转（增加等待时间）
    console.log('\n4️⃣  等待页面跳转...');
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log('   最终URL:', finalUrl);

    // 5. 验证结果
    console.log('\n5️⃣  验证结果...');
    if (finalUrl.includes('/dashboard')) {
      console.log('   ✅ 成功！已跳转到工作台');
      console.log('   ✅ 登录跳转问题已修复！');

      // 验证页面内容
      await page.waitForTimeout(2000);
      const pageText = await page.textContent('body');
      if (pageText.includes('工作台') || pageText.includes('艾居来')) {
        console.log('   ✅ 页面内容加载正常');
      }

      return true;
    } else if (finalUrl.includes('/login')) {
      console.log('   ❌ 失败：仍然停留在登录页');
      console.log('   需要进一步调试...');
      return false;
    } else if (finalUrl === 'http://localhost:5173/') {
      console.log('   ⚠️  跳转到根路径，应该会自动重定向到dashboard');
      console.log('   等待重定向...');
      await page.waitForTimeout(2000);
      const afterRedirect = page.url();
      console.log('   重定向后URL:', afterRedirect);
      if (afterRedirect.includes('/dashboard')) {
        console.log('   ✅ 重定向成功！');
        return true;
      }
      return false;
    } else {
      console.log('   ⚠️  跳转到了意外的页面:', finalUrl);
      return false;
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    return false;
  } finally {
    console.log('\n💡 浏览器将在5秒后关闭...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testLogin().then(success => {
  if (success) {
    console.log('\n🎉 测试通过！登录功能正常！');
    process.exit(0);
  } else {
    console.log('\n⚠️  测试未完全通过，请查看上面的输出');
    process.exit(1);
  }
});
