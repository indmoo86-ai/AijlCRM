/**
 * 线索预警定时任务
 *
 * 预警规则：
 * 1. 创建后1天未联系 -> 橙色预警(level=1)
 * 2. 创建后2天未联系 -> 红色预警(level=2)
 * 3. 跟踪后 -> 绿色正常(level=0)
 * 4. 超过预计下次跟踪时间1天 -> 橙色预警(level=1)
 * 5. 超过预计下次跟踪时间2天 -> 红色预警(level=2)
 * 6. 已转化或已放弃的线索不预警
 */

const { Op } = require('sequelize');

/**
 * 更新线索预警状态
 */
async function updateLeadWarnings() {
  const { Lead } = require('../models');
  const now = new Date();

  // 获取当前日期（不含时间）
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1天前
  const oneDayAgo = new Date(today);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  // 2天前
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  console.log(`[${new Date().toISOString()}] 开始执行线索预警任务...`);
  console.log(`  今日: ${today.toISOString()}`);
  console.log(`  1天前: ${oneDayAgo.toISOString()}`);
  console.log(`  2天前: ${twoDaysAgo.toISOString()}`);

  try {
    // 获取所有活跃线索（状态为新建或跟进中）
    const activeLeads = await Lead.findAll({
      where: {
        status: { [Op.in]: [1, 2] } // 1新建 2跟进中
      }
    });

    console.log(`  找到 ${activeLeads.length} 条活跃线索`);

    let updatedCount = 0;

    for (const lead of activeLeads) {
      let newWarningLevel = 0; // 默认正常

      const lastFollowTime = lead.lastFollowTime ? new Date(lead.lastFollowTime) : null;
      const nextFollowDate = lead.nextFollowDate ? new Date(lead.nextFollowDate) : null;
      const createdAt = new Date(lead.created_at);

      // 判断逻辑
      if (lastFollowTime) {
        // 有跟踪记录的情况
        if (nextFollowDate) {
          // 有下次跟踪日期，检查是否超期
          const diffDays = Math.floor((today - nextFollowDate) / (1000 * 60 * 60 * 24));
          if (diffDays >= 2) {
            newWarningLevel = 2; // 红色预警：超过2天
          } else if (diffDays >= 1) {
            newWarningLevel = 1; // 橙色预警：超过1天
          } else {
            newWarningLevel = 0; // 正常
          }
        } else {
          // 没有设置下次跟踪日期，检查最后跟踪时间
          const lastFollowDate = new Date(lastFollowTime.getFullYear(), lastFollowTime.getMonth(), lastFollowTime.getDate());
          const diffDays = Math.floor((today - lastFollowDate) / (1000 * 60 * 60 * 24));
          if (diffDays >= 2) {
            newWarningLevel = 2; // 红色预警
          } else if (diffDays >= 1) {
            newWarningLevel = 1; // 橙色预警
          } else {
            newWarningLevel = 0; // 正常
          }
        }
      } else {
        // 没有跟踪记录，检查创建时间
        const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
        const diffDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 2) {
          newWarningLevel = 2; // 红色预警：创建后2天未联系
        } else if (diffDays >= 1) {
          newWarningLevel = 1; // 橙色预警：创建后1天未联系
        } else {
          newWarningLevel = 0; // 正常：当天创建
        }
      }

      // 只有预警级别变化时才更新
      if (lead.warningLevel !== newWarningLevel) {
        await lead.update({ warningLevel: newWarningLevel });
        updatedCount++;
        console.log(`  线索 ${lead.leadNo}: ${lead.warningLevel} -> ${newWarningLevel}`);
      }
    }

    // 将已转化或已放弃的线索预警级别设为0
    const resetResult = await Lead.update(
      { warningLevel: 0 },
      {
        where: {
          status: { [Op.in]: [3, 4] }, // 3已转化 4已放弃
          warningLevel: { [Op.ne]: 0 }
        }
      }
    );

    console.log(`[${new Date().toISOString()}] 线索预警任务完成`);
    console.log(`  更新了 ${updatedCount} 条线索预警状态`);
    console.log(`  重置了 ${resetResult[0]} 条已完结线索`);

    return { success: true, updated: updatedCount, reset: resetResult[0] };
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 线索预警任务失败:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * 跟踪后重置预警状态（在添加跟踪记录时调用）
 */
async function resetWarningAfterFollowUp(leadId) {
  const { Lead } = require('../models');
  try {
    await Lead.update(
      { warningLevel: 0 },
      { where: { id: leadId } }
    );
    console.log(`线索 ${leadId} 预警状态已重置`);
  } catch (err) {
    console.error(`重置线索 ${leadId} 预警状态失败:`, err);
  }
}

module.exports = {
  updateLeadWarnings,
  resetWarningAfterFollowUp
};
