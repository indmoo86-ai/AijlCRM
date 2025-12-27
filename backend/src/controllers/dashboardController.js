const { Lead, Customer, Quotation, Contract, Task, Payment, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * 获取仪表板统计数据
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = moment();
    const monthStart = now.clone().startOf('month').toDate();
    const monthEnd = now.clone().endOf('month').toDate();

    // 线索统计
    const leadsCount = await Lead.count({
      where: { owner_id: userId }
    });

    const leadsCountThisMonth = await Lead.count({
      where: {
        owner_id: userId,
        created_at: {
          [Op.between]: [monthStart, monthEnd]
        }
      }
    });

    // 客户统计
    const customersCount = await Customer.count({
      where: { owner_id: userId }
    });

    const customersCountThisMonth = await Customer.count({
      where: {
        owner_id: userId,
        created_at: {
          [Op.between]: [monthStart, monthEnd]
        }
      }
    });

    // 待办任务统计
    const pendingTasks = await Task.count({
      where: {
        assigned_to: userId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      }
    });

    const overdueTasks = await Task.count({
      where: {
        assigned_to: userId,
        status: { [Op.in]: ['pending', 'in_progress'] },
        due_date: { [Op.lt]: new Date() }
      }
    });

    // 本月合同金额
    const monthlyContracts = await Contract.findAll({
      where: {
        owner_id: userId,
        created_at: {
          [Op.between]: [monthStart, monthEnd]
        }
      },
      attributes: ['contract_amount']
    });

    const monthlyContractAmount = monthlyContracts.reduce((sum, contract) => {
      return sum + parseFloat(contract.contract_amount || 0);
    }, 0);

    const contractsCount = monthlyContracts.length;

    res.json({
      success: true,
      data: {
        leads: {
          count: leadsCount,
          monthlyChange: leadsCountThisMonth
        },
        customers: {
          count: customersCount,
          monthlyChange: customersCountThisMonth
        },
        tasks: {
          pending: pendingTasks,
          overdue: overdueTasks
        },
        contracts: {
          monthlyAmount: monthlyContractAmount,
          count: contractsCount
        }
      }
    });
  } catch (error) {
    console.error('获取仪表板统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};

/**
 * 获取销售漏斗数据
 */
exports.getSalesFunnel = async (req, res) => {
  try {
    const userId = req.user.id;

    const leadsCount = await Lead.count({ where: { owner_id: userId } });
    const customersCount = await Customer.count({ where: { owner_id: userId } });
    const quotationsCount = await Quotation.count({ where: { owner_id: userId } });
    const contractsCount = await Contract.count({ where: { owner_id: userId } });
    const activeContractsCount = await Contract.count({
      where: { owner_id: userId, status: 'active' }
    });

    res.json({
      success: true,
      data: [
        { name: '线索', value: leadsCount },
        { name: '客户', value: customersCount },
        { name: '报价', value: quotationsCount },
        { name: '合同', value: contractsCount },
        { name: '成交', value: activeContractsCount }
      ]
    });
  } catch (error) {
    console.error('获取销售漏斗数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取销售漏斗数据失败',
      error: error.message
    });
  }
};

/**
 * 获取业绩趋势数据
 */
exports.getPerformanceTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query; // week, month, quarter

    let startDate, dateFormat, groupBy;
    const now = moment();

    switch (period) {
      case 'week':
        startDate = now.clone().subtract(7, 'days').toDate();
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
        break;
      case 'quarter':
        startDate = now.clone().subtract(3, 'months').toDate();
        dateFormat = '%Y-%m';
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        break;
      case 'month':
      default:
        startDate = now.clone().subtract(30, 'days').toDate();
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
    }

    const contracts = await Contract.findAll({
      where: {
        owner_id: userId,
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        [Contract.sequelize.fn('DATE_FORMAT', Contract.sequelize.col('created_at'), dateFormat), 'date'],
        [Contract.sequelize.fn('COUNT', Contract.sequelize.col('contract_id')), 'count'],
        [Contract.sequelize.fn('SUM', Contract.sequelize.col('contract_amount')), 'amount']
      ],
      group: [groupBy],
      order: [[Contract.sequelize.literal('date'), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('获取业绩趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取业绩趋势数据失败',
      error: error.message
    });
  }
};

/**
 * 获取最近活动
 */
exports.getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // 这里简化处理，实际应该查询审计日志表
    const activities = [];

    // 最近的线索
    const recentLeads = await Lead.findAll({
      where: { owner_id: userId },
      order: [['created_at', 'DESC']],
      limit: 3,
      attributes: ['lead_name', 'created_at']
    });

    recentLeads.forEach(lead => {
      activities.push({
        type: 'create',
        content: `创建了线索：${lead.lead_name}`,
        created_at: lead.created_at
      });
    });

    // 最近的合同
    const recentContracts = await Contract.findAll({
      where: { owner_id: userId },
      order: [['created_at', 'DESC']],
      limit: 3,
      attributes: ['contract_no', 'created_at']
    });

    recentContracts.forEach(contract => {
      activities.push({
        type: 'create',
        content: `创建了合同：${contract.contract_no}`,
        created_at: contract.created_at
      });
    });

    // 按时间排序
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: activities.slice(0, limit)
    });
  } catch (error) {
    console.error('获取最近活动失败:', error);
    res.status(500).json({
      success: false,
      message: '获取最近活动失败',
      error: error.message
    });
  }
};
