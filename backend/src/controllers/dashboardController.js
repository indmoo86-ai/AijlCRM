const { Lead, Customer, Quotation, Contract, Task, Payment, User, QuotationItem, ContractItem, Product } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
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
      where: { sales_owner_id: userId }
    });

    const leadsCountThisMonth = await Lead.count({
      where: {
        sales_owner_id: userId,
        created_at: {
          [Op.between]: [monthStart, monthEnd]
        }
      }
    });

    // 客户统计
    const customersCount = await Customer.count({
      where: { sales_owner_id: userId }
    });

    const customersCountThisMonth = await Customer.count({
      where: {
        sales_owner_id: userId,
        created_at: {
          [Op.between]: [monthStart, monthEnd]
        }
      }
    });

    // 待办任务统计
    const pendingTasks = await Task.count({
      where: {
        assignee_id: userId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      }
    });

    const overdueTasks = await Task.count({
      where: {
        assignee_id: userId,
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
    console.error('错误详情:', error.message);
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

    const leadsCount = await Lead.count({ where: { sales_owner_id: userId } });
    const customersCount = await Customer.count({ where: { sales_owner_id: userId } });
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
    console.error('错误详情:', error.message);
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
    console.error('错误详情:', error.message);
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
      where: { sales_owner_id: userId },
      order: [['created_at', 'DESC']],
      limit: 3,
      attributes: ['customerName', 'created_at']
    });

    recentLeads.forEach(lead => {
      activities.push({
        type: 'create',
        content: `创建了线索：${lead.customerName}`,
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
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '获取最近活动失败',
      error: error.message
    });
  }
};

/**
 * 获取任务统计（按状态分布）
 */
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取各状态任务数量
    const statusCounts = await Task.findAll({
      where: { assignee_id: userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('task_id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // 转换为前端需要的格式
    const statusMap = {
      'pending': '待处理',
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };

    const colorMap = {
      'pending': '#e6a23c',
      'in_progress': '#409eff',
      'completed': '#67c23a',
      'cancelled': '#909399'
    };

    const data = statusCounts.map(item => ({
      name: statusMap[item.status] || item.status,
      value: parseInt(item.count),
      itemStyle: { color: colorMap[item.status] || '#409eff' }
    }));

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('获取任务统计失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '获取任务统计失败',
      error: error.message
    });
  }
};

/**
 * 获取客户类型分布
 */
exports.getCustomerTypeStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取各类型客户数量
    const typeCounts = await Customer.findAll({
      where: { sales_owner_id: userId },
      attributes: [
        'customerType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['customerType'],
      raw: true
    });

    // 转换为前端需要的格式 (customer_type: 1潜在/2正式/3VIP)
    const typeMap = {
      1: '潜在客户',
      2: '正式客户',
      3: 'VIP客户'
    };

    const colorMap = {
      1: '#909399',
      2: '#409eff',
      3: '#f56c6c'
    };

    const data = typeCounts.map(item => ({
      name: typeMap[item.customerType] || `类型${item.customerType}`,
      value: parseInt(item.count),
      itemStyle: { color: colorMap[item.customerType] || '#409eff' }
    }));

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('获取客户类型统计失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '获取客户类型统计失败',
      error: error.message
    });
  }
};

/**
 * 获取产品销售排行
 */
exports.getProductSalesRank = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // 从合同明细中统计产品销售数量
    const productSales = await ContractItem.findAll({
      attributes: [
        'product_id',
        'product_name',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_amount']
      ],
      group: ['product_id', 'product_name'],
      order: [[sequelize.literal('total_quantity'), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });

    // 格式化数据
    const data = productSales.map(item => ({
      name: item.product_name || `产品${item.product_id}`,
      value: parseInt(item.total_quantity) || 0,
      amount: parseFloat(item.total_amount) || 0
    }));

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('获取产品销售排行失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '获取产品销售排行失败',
      error: error.message
    });
  }
};

/**
 * 获取待办任务列表
 */
exports.getTodoTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const tasks = await Task.findAll({
      where: {
        assignee_id: userId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      order: [
        ['due_date', 'ASC'],
        ['priority', 'DESC']
      ],
      limit: parseInt(limit),
      attributes: ['task_id', 'task_title', 'due_date', 'priority', 'status']
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('获取待办任务失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '获取待办任务失败',
      error: error.message
    });
  }
};

/**
 * 获取业绩趋势（按月统计合同和回款）
 */
exports.getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { months = 12 } = req.query;

    // 获取过去n个月的日期范围
    const startDate = moment().subtract(months - 1, 'months').startOf('month').toDate();

    // 按月统计合同金额
    const contractTrend = await Contract.findAll({
      where: {
        owner_id: userId,
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('strftime', '%Y-%m', sequelize.col('created_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('contract_amount')), 'amount']
      ],
      group: [sequelize.fn('strftime', '%Y-%m', sequelize.col('created_at'))],
      order: [[sequelize.literal('month'), 'ASC']],
      raw: true
    });

    // 按月统计回款金额
    const paymentTrend = await Payment.findAll({
      where: {
        created_at: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('strftime', '%Y-%m', sequelize.col('created_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('payment_amount')), 'amount']
      ],
      group: [sequelize.fn('strftime', '%Y-%m', sequelize.col('created_at'))],
      order: [[sequelize.literal('month'), 'ASC']],
      raw: true
    });

    // 生成完整的月份序列
    const monthLabels = [];
    const contractData = [];
    const paymentData = [];

    for (let i = months - 1; i >= 0; i--) {
      const month = moment().subtract(i, 'months').format('YYYY-MM');
      const monthLabel = moment().subtract(i, 'months').format('M月');
      monthLabels.push(monthLabel);

      const contractItem = contractTrend.find(item => item.month === month);
      contractData.push(contractItem ? Math.round(parseFloat(contractItem.amount) / 10000) : 0);

      const paymentItem = paymentTrend.find(item => item.month === month);
      paymentData.push(paymentItem ? Math.round(parseFloat(paymentItem.amount) / 10000) : 0);
    }

    res.json({
      success: true,
      data: {
        labels: monthLabels,
        contract: contractData,
        payment: paymentData
      }
    });
  } catch (error) {
    console.error('获取月度趋势失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '获取月度趋势失败',
      error: error.message
    });
  }
};
