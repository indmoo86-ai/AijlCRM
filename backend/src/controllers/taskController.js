/**
 * 待办任务管理 Controller
 */
const Task = require('../models/Task');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 查询任务列表
 * GET /api/tasks
 */
exports.getTaskList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, priority, assigneeId, taskType, dueDate } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assignee_id = assigneeId;
    if (taskType) where.task_type = taskType;
    if (dueDate) where.due_date = dueDate;

    const { count, rows } = await Task.findAndCountAll({
      where,
      order: [['due_date', 'ASC'], ['priority', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    return success(res, {
      list: rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    }, '查询成功');
  } catch (err) {
    console.error('查询任务列表失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询任务列表失败', 500);
  }
};

/**
 * 查询任务详情
 * GET /api/tasks/:id
 */
exports.getTaskDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return error(res, '任务不存在', 404);
    }

    return success(res, task, '查询成功');
  } catch (err) {
    console.error('查询任务详情失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询任务详情失败', 500);
  }
};

/**
 * 分配任务
 * PUT /api/tasks/:id/assign
 */
exports.assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId, assignReason } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return error(res, '任务不存在', 404);
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      return error(res, '已完成或已取消的任务不能重新分配', 400);
    }

    await task.update({
      assignee_id: assigneeId,
      assigner_id: req.user.id,
      assigned_at: new Date(),
      updated_by: req.user.id,
      result_note: assignReason ? `重新分配原因：${assignReason}` : task.result_note
    });

    return success(res, task, '任务分配成功');
  } catch (err) {
    console.error('分配任务失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '分配任务失败', 500);
  }
};

/**
 * 完成任务
 * PUT /api/tasks/:id/complete
 */
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultNote } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return error(res, '任务不存在', 404);
    }

    if (task.status === 'completed') {
      return error(res, '任务已完成', 400);
    }

    if (task.status === 'cancelled') {
      return error(res, '已取消的任务不能完成', 400);
    }

    await task.update({
      status: 'completed',
      completed_at: new Date(),
      result_note: resultNote,
      updated_by: req.user.id
    });

    return success(res, {
      taskId: task.task_id,
      status: task.status,
      completedAt: task.completed_at
    }, '任务完成成功');
  } catch (err) {
    console.error('完成任务失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '完成任务失败', 500);
  }
};

/**
 * 延期任务
 * PUT /api/tasks/:id/defer
 */
exports.deferTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDueDate, deferReason } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return error(res, '任务不存在', 404);
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      return error(res, '已完成或已取消的任务不能延期', 400);
    }

    await task.update({
      due_date: newDueDate,
      status: 'pending', // 延期后恢复为待处理状态
      result_note: deferReason ? `延期原因：${deferReason}\n${task.result_note || ''}` : task.result_note,
      updated_by: req.user.id
    });

    return success(res, task, '任务延期成功');
  } catch (err) {
    console.error('延期任务失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '延期任务失败', 500);
  }
};

/**
 * 查询逾期任务
 * GET /api/tasks/overdue
 */
exports.getOverdueTasks = async (req, res) => {
  try {
    const { assigneeId, taskType } = req.query;

    const where = {
      status: {
        [Op.in]: ['pending', 'in_progress']
      },
      due_date: {
        [Op.lt]: new Date()
      }
    };

    if (assigneeId) where.assignee_id = assigneeId;
    if (taskType) where.task_type = taskType;

    const tasks = await Task.findAll({
      where,
      order: [['due_date', 'ASC']]
    });

    return success(res, tasks, '查询成功');
  } catch (err) {
    console.error('查询逾期任务失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询逾期任务失败', 500);
  }
};

/**
 * 任务统计分析
 * GET /api/tasks/statistics
 */
exports.getTaskStatistics = async (req, res) => {
  try {
    const { assigneeId, startDate, endDate } = req.query;

    const where = {};
    if (assigneeId) where.assignee_id = assigneeId;
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }

    // 总任务数
    const totalTasks = await Task.count({ where });

    // 待处理任务数
    const pendingTasks = await Task.count({
      where: { ...where, status: 'pending' }
    });

    // 已完成任务数
    const completedTasks = await Task.count({
      where: { ...where, status: 'completed' }
    });

    // 逾期任务数
    const overdueTasks = await Task.count({
      where: {
        ...where,
        status: {
          [Op.in]: ['pending', 'in_progress']
        },
        due_date: {
          [Op.lt]: new Date()
        }
      }
    });

    // 完成率
    const completionRate = totalTasks > 0 
      ? (completedTasks / totalTasks * 100).toFixed(1) 
      : 0;

    // 逾期率
    const overdueRate = totalTasks > 0 
      ? (overdueTasks / totalTasks * 100).toFixed(1) 
      : 0;

    // 按类型统计
    const tasksByType = await Task.findAll({
      where,
      attributes: [
        'task_type',
        [Task.sequelize.fn('COUNT', Task.sequelize.col('task_id')), 'count']
      ],
      group: ['task_type'],
      raw: true
    });

    const byType = {};
    tasksByType.forEach(item => {
      byType[item.task_type] = parseInt(item.count);
    });

    return success(res, {
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      completionRate: parseFloat(completionRate),
      overdueRate: parseFloat(overdueRate),
      avgResponseTime: 0, // TODO: 实现平均响应时间计算
      byType
    }, '查询成功');
  } catch (err) {
    console.error('任务统计分析失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '任务统计分析失败', 500);
  }
};
