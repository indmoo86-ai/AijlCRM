/**
 * 业务状态常量定义
 */

// 线索状态
const LEAD_STATUS = {
  NEW: 1,           // 新建
  FOLLOWING: 2,     // 跟进中
  CONVERTED: 3,     // 已转化
  ABANDONED: 4      // 已放弃
};

// 线索状态描述
const LEAD_STATUS_DESC = {
  [LEAD_STATUS.NEW]: '新建',
  [LEAD_STATUS.FOLLOWING]: '跟进中',
  [LEAD_STATUS.CONVERTED]: '已转化',
  [LEAD_STATUS.ABANDONED]: '已放弃'
};

// 报价单状态
const QUOTATION_STATUS = {
  DRAFT: 'draft',       // 草稿
  PENDING: 'pending',   // 待审批
  APPROVED: 'approved', // 已通过
  REJECTED: 'rejected', // 已拒绝
  SENT: 'sent',         // 已发送
  ACCEPTED: 'accepted', // 已接受
  VOIDED: 'voided'      // 已作废
};

// 报价单状态描述
const QUOTATION_STATUS_DESC = {
  [QUOTATION_STATUS.DRAFT]: '草稿',
  [QUOTATION_STATUS.PENDING]: '待审批',
  [QUOTATION_STATUS.APPROVED]: '已通过',
  [QUOTATION_STATUS.REJECTED]: '已拒绝',
  [QUOTATION_STATUS.SENT]: '已发送',
  [QUOTATION_STATUS.ACCEPTED]: '已接受',
  [QUOTATION_STATUS.VOIDED]: '已作废'
};

// 合同状态
const CONTRACT_STATUS = {
  DRAFT: 'draft',           // 草稿
  PENDING: 'pending',       // 待确认
  SENT: 'sent',             // 已寄出
  SIGNED: 'signed',         // 已签订
  ACTIVE: 'active',         // 执行中
  COMPLETED: 'completed',   // 已完成
  TERMINATED: 'terminated', // 已终止
  VOIDED: 'voided'          // 已作废
};

// 合同状态描述
const CONTRACT_STATUS_DESC = {
  [CONTRACT_STATUS.DRAFT]: '草稿',
  [CONTRACT_STATUS.PENDING]: '待确认',
  [CONTRACT_STATUS.SENT]: '已寄出',
  [CONTRACT_STATUS.SIGNED]: '已签订',
  [CONTRACT_STATUS.ACTIVE]: '执行中',
  [CONTRACT_STATUS.COMPLETED]: '已完成',
  [CONTRACT_STATUS.TERMINATED]: '已终止',
  [CONTRACT_STATUS.VOIDED]: '已作废'
};

module.exports = {
  LEAD_STATUS,
  LEAD_STATUS_DESC,
  QUOTATION_STATUS,
  QUOTATION_STATUS_DESC,
  CONTRACT_STATUS,
  CONTRACT_STATUS_DESC
};
