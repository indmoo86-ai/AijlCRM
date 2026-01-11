const { LEAD_STATUS, QUOTATION_STATUS, CONTRACT_STATUS } = require('../constants/status');

/**
 * 状态机配置 - 定义允许的状态转换
 */
const TRANSITIONS = {
  // 线索状态流转
  lead: {
    [LEAD_STATUS.NEW]: [LEAD_STATUS.FOLLOWING, LEAD_STATUS.ABANDONED, LEAD_STATUS.CONVERTED],
    [LEAD_STATUS.FOLLOWING]: [LEAD_STATUS.CONVERTED, LEAD_STATUS.ABANDONED],
    [LEAD_STATUS.CONVERTED]: [], // 终态
    [LEAD_STATUS.ABANDONED]: [LEAD_STATUS.FOLLOWING] // 允许恢复跟进
  },

  // 报价单状态流转
  quotation: {
    [QUOTATION_STATUS.DRAFT]: [QUOTATION_STATUS.PENDING, QUOTATION_STATUS.SENT, QUOTATION_STATUS.VOIDED],
    [QUOTATION_STATUS.PENDING]: [QUOTATION_STATUS.APPROVED, QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.DRAFT], // 允许撤回draft
    [QUOTATION_STATUS.APPROVED]: [QUOTATION_STATUS.SENT, QUOTATION_STATUS.VOIDED, QUOTATION_STATUS.ACCEPTED], // 允许直接accept
    [QUOTATION_STATUS.REJECTED]: [QUOTATION_STATUS.DRAFT, QUOTATION_STATUS.VOIDED],
    [QUOTATION_STATUS.SENT]: [QUOTATION_STATUS.ACCEPTED, QUOTATION_STATUS.VOIDED],
    [QUOTATION_STATUS.ACCEPTED]: [QUOTATION_STATUS.VOIDED], // 特殊情况允许作废
    [QUOTATION_STATUS.VOIDED]: [QUOTATION_STATUS.DRAFT] // 允许复制/恢复为草稿
  },

  // 合同状态流转
  contract: {
    [CONTRACT_STATUS.DRAFT]: [CONTRACT_STATUS.PENDING, CONTRACT_STATUS.VOIDED],
    [CONTRACT_STATUS.PENDING]: [CONTRACT_STATUS.SENT, CONTRACT_STATUS.DRAFT, CONTRACT_STATUS.SIGNED, CONTRACT_STATUS.VOIDED], // 允许撤回/直接签订
    [CONTRACT_STATUS.SENT]: [CONTRACT_STATUS.SIGNED, CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.VOIDED], // active是收回后的状态
    [CONTRACT_STATUS.SIGNED]: [CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.VOIDED, CONTRACT_STATUS.TERMINATED],
    [CONTRACT_STATUS.ACTIVE]: [CONTRACT_STATUS.COMPLETED, CONTRACT_STATUS.TERMINATED, CONTRACT_STATUS.VOIDED],
    [CONTRACT_STATUS.COMPLETED]: [], // 终态
    [CONTRACT_STATUS.TERMINATED]: [], // 终态
    [CONTRACT_STATUS.VOIDED]: [CONTRACT_STATUS.DRAFT] // 允许恢复
  }
};

/**
 * 状态机服务
 */
class StateMachineService {
  /**
   * 验证状态转换是否合法
   * @param {string} entityType - 实体类型 ('lead', 'quotation', 'contract')
   * @param {string|number} currentStatus - 当前状态
   * @param {string|number} nextStatus - 目标状态
   * @returns {boolean}
   */
  static validateTransition(entityType, currentStatus, nextStatus) {
    if (!TRANSITIONS[entityType]) {
      throw new Error(`未知实体类型: ${entityType}`);
    }

    const allowedTransitions = TRANSITIONS[entityType][currentStatus];

    // 如果没有定义当前状态的流转规则，或者不允许流转到目标状态
    if (!allowedTransitions || !allowedTransitions.includes(nextStatus)) {
      return false;
    }

    return true;
  }

  /**
   * 获取允许的下一个状态列表
   * @param {string} entityType
   * @param {string|number} currentStatus
   * @returns {Array}
   */
  static getAllowedTransitions(entityType, currentStatus) {
    if (!TRANSITIONS[entityType]) return [];
    return TRANSITIONS[entityType][currentStatus] || [];
  }

  /**
   * 检查状态是否为终态
   * @param {string} entityType
   * @param {string|number} status
   * @returns {boolean}
   */
  static isTerminalState(entityType, status) {
    const transitions = this.getAllowedTransitions(entityType, status);
    return transitions.length === 0;
  }
}

module.exports = StateMachineService;
