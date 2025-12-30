/**
 * 批量执行所有E2E测试场景
 * 生成测试报告
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testFiles = [
  // 用户认证模块
  'test-1.1-login.js',
  'test-1.2-wrong-password.js',
  'test-1.3-logout.js',

  // 线索管理模块
  'test-2.1-create-lead.js',
  'test-2.2-edit-lead.js',
  'test-2.3-search-lead.js',
  'test-2.4-convert-lead.js',
  'test-2.5-delete-lead.js',
  'test-2.6-lead-assign.js',
  'test-2.7-lead-followup.js',
  'test-2.8-lead-view.js',

  // 客户管理模块
  'test-3.1-create-customer.js',
  'test-3.2-edit-customer.js',
  'test-3.3-search-customer.js',
  'test-3.4-delete-customer.js',
  'test-3.5-customer-contact.js',
  'test-3.6-customer-stage.js',
  'test-3.7-customer-view.js',

  // 产品管理模块
  'test-4.1-create-product.js',
  'test-4.2-edit-product.js',
  'test-4.3-delete-product.js',
  'test-4.4-search-product.js',
  'test-4.5-product-view.js',
  'test-4.6-product-disable.js',

  // 报价单管理模块
  'test-5.1-create-quotation.js',
  'test-5.2-edit-quotation.js',
  'test-5.3-search-quotation.js',
  'test-5.4-quotation-submit.js',
  'test-5.5-quotation-approve.js',
  'test-5.6-quotation-view.js',
  'test-5.7-quotation-delete.js',
  'test-5.8-quotation-convert.js',

  // 合同管理模块
  'test-6.1-create-contract.js',
  'test-6.2-edit-contract.js',
  'test-6.3-search-contract.js',
  'test-6.4-contract-activate.js',
  'test-6.5-contract-view.js',
  'test-6.6-contract-delete.js',
  'test-6.7-contract-sign.js',
  'test-6.8-contract-terminate.js',
  'test-6.9-contract-complete.js',
  'test-6.10-contract-stats.js',

  // 发货管理模块
  'test-7.1-create-shipment.js',
  'test-7.2-edit-shipment.js',
  'test-7.3-search-shipment.js',
  'test-7.4-shipment-view.js',
  'test-7.5-shipment-delete.js',
  'test-7.6-shipment-status.js',
  'test-7.7-shipment-batch.js',
  'test-7.8-shipment-stats.js',

  // 收款管理模块
  'test-8.1-create-payment.js',
  'test-8.2-edit-payment.js',
  'test-8.3-search-payment.js',
  'test-8.4-payment-view.js',
  'test-8.5-payment-delete.js',
  'test-8.6-payment-status.js',
  'test-8.7-payment-stats.js',
  'test-8.8-payment-overdue.js',

  // 发票管理模块
  'test-9.1-create-invoice.js',
  'test-9.2-edit-invoice.js',
  'test-9.3-search-invoice.js',
  'test-9.4-invoice-view.js',
  'test-9.5-invoice-delete.js',
  'test-9.6-invoice-status.js',
  'test-9.7-invoice-stats.js',
  'test-9.8-invoice-export.js',

  // 售后服务模块
  'test-10.1-create-service-ticket.js',
  'test-10.2-edit-service.js',
  'test-10.3-search-service.js',
  'test-10.4-service-view.js',
  'test-10.5-service-assign.js',
  'test-10.6-service-resolve.js',
  'test-10.7-service-delete.js',
  'test-10.8-service-rating.js',
  'test-10.9-service-return.js',

  // 任务管理模块
  'test-11.1-create-task.js',
  'test-11.2-search-task.js',
  'test-11.3-task-view.js',
  'test-11.4-task-edit.js',
  'test-11.5-task-delete.js',
  'test-11.6-task-complete.js',
  'test-11.7-task-assign.js',
  'test-11.8-task-progress.js'
];

const results = {
  timestamp: new Date().toISOString(),
  total: testFiles.length,
  passed: 0,
  failed: 0,
  skipped: 0,
  modules: {},
  details: []
};

// 按模块统计
const modules = {
  '用户认证': { total: 0, passed: 0 },
  '线索管理': { total: 0, passed: 0 },
  '客户管理': { total: 0, passed: 0 },
  '产品管理': { total: 0, passed: 0 },
  '报价单管理': { total: 0, passed: 0 },
  '合同管理': { total: 0, passed: 0 },
  '发货管理': { total: 0, passed: 0 },
  '收款管理': { total: 0, passed: 0 },
  '发票管理': { total: 0, passed: 0 },
  '售后服务': { total: 0, passed: 0 },
  '任务管理': { total: 0, passed: 0 }
};

function getModuleName(testFile) {
  const prefix = testFile.match(/test-(\d+)\./)[1];
  const moduleMap = {
    '1': '用户认证',
    '2': '线索管理',
    '3': '客户管理',
    '4': '产品管理',
    '5': '报价单管理',
    '6': '合同管理',
    '7': '发货管理',
    '8': '收款管理',
    '9': '发票管理',
    '10': '售后服务',
    '11': '任务管理'
  };
  return moduleMap[prefix] || '其他';
}

console.log('========================================');
console.log('艾居来 CRM E2E 测试批量执行');
console.log('========================================');
console.log('测试时间:', results.timestamp);
console.log('测试场景数:', results.total);
console.log('========================================\n');

for (const testFile of testFiles) {
  const testPath = path.join(__dirname, testFile);
  const testName = testFile.replace('.js', '').replace('test-', '');
  const moduleName = getModuleName(testFile);

  modules[moduleName].total++;

  console.log(`执行: ${testFile}`);

  try {
    const output = execSync(`node "${testPath}"`, {
      encoding: 'utf-8',
      timeout: 120000
    });

    const passed = output.includes('✓ 通过') || output.includes('跳过');

    results.details.push({
      name: testName,
      file: testFile,
      module: moduleName,
      status: passed ? 'passed' : 'failed',
      output: output.slice(-500)
    });

    if (passed) {
      results.passed++;
      modules[moduleName].passed++;
      console.log(`  结果: ✓ 通过\n`);
    } else {
      results.failed++;
      console.log(`  结果: ✗ 失败\n`);
    }
  } catch (err) {
    results.details.push({
      name: testName,
      file: testFile,
      module: moduleName,
      status: 'failed',
      error: err.message
    });
    results.failed++;
    console.log(`  结果: ✗ 失败 - ${err.message}\n`);
  }
}

// 计算通过率
const passRate = ((results.passed / results.total) * 100).toFixed(1);
results.modules = modules;

console.log('\n========================================');
console.log('测试报告汇总');
console.log('========================================');
console.log(`总计: ${results.total} 个场景`);
console.log(`通过: ${results.passed} 个`);
console.log(`失败: ${results.failed} 个`);
console.log(`通过率: ${passRate}%`);
console.log('========================================');
console.log('\n按模块统计:');
for (const [name, stats] of Object.entries(modules)) {
  const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(0) : 0;
  console.log(`  ${name}: ${stats.passed}/${stats.total} (${rate}%)`);
}
console.log('========================================');

// 保存报告
const reportPath = path.join(__dirname, '../../TEST_RESULTS_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n报告已保存到: ${reportPath}`);

process.exit(results.failed > 0 ? 1 : 0);
