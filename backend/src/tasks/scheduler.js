/**
 * 定时任务调度器
 */

const { updateLeadWarnings } = require('./leadWarningTask');

// 定时任务间隔（毫秒）
const LEAD_WARNING_INTERVAL = 60 * 60 * 1000; // 每小时执行一次

let leadWarningTimer = null;

/**
 * 启动所有定时任务
 */
function startScheduler() {
  console.log('[Scheduler] 启动定时任务调度器...');

  // 立即执行一次线索预警任务
  updateLeadWarnings();

  // 设置定时执行
  leadWarningTimer = setInterval(() => {
    updateLeadWarnings();
  }, LEAD_WARNING_INTERVAL);

  console.log(`[Scheduler] 线索预警任务已启动，间隔: ${LEAD_WARNING_INTERVAL / 1000 / 60} 分钟`);
}

/**
 * 停止所有定时任务
 */
function stopScheduler() {
  if (leadWarningTimer) {
    clearInterval(leadWarningTimer);
    leadWarningTimer = null;
    console.log('[Scheduler] 定时任务已停止');
  }
}

/**
 * 手动触发线索预警任务
 */
async function triggerLeadWarningTask() {
  return await updateLeadWarnings();
}

module.exports = {
  startScheduler,
  stopScheduler,
  triggerLeadWarningTask
};
