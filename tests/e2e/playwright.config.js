// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './specs',

  // 测试超时时间
  timeout: 30 * 1000,

  // 每个测试重试次数
  retries: 1,

  // 并行执行的worker数量
  workers: 1,

  // 报告配置
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // 全局配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:5173',

    // 截图配置
    screenshot: 'only-on-failure',

    // 录屏配置
    video: 'retain-on-failure',

    // 追踪配置
    trace: 'on-first-retry',

    // 浏览器配置
    headless: true,

    // 视窗大小
    viewport: { width: 1280, height: 720 },
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Web Server配置（可选）
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
