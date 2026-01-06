/**
 * 权限管理控制器 - PermissionController
 */
const { Permission } = require('../models');
const { success, error } = require('../utils/response');

// 预定义的权限数据（页面级和按钮级）
const PREDEFINED_PERMISSIONS = [
  // 工作台
  { permission_code: 'dashboard:view', permission_name: '访问工作台', module_name: '工作台', permission_type: 'menu', sort_order: 100 },

  // 线索管理
  { permission_code: 'lead:view', permission_name: '访问线索管理', module_name: '线索管理', permission_type: 'menu', sort_order: 200 },
  { permission_code: 'lead:create', permission_name: '创建线索', module_name: '线索管理', permission_type: 'action', sort_order: 201 },
  { permission_code: 'lead:edit', permission_name: '编辑线索', module_name: '线索管理', permission_type: 'action', sort_order: 202 },
  { permission_code: 'lead:delete', permission_name: '删除线索', module_name: '线索管理', permission_type: 'action', sort_order: 203 },
  { permission_code: 'lead:follow', permission_name: '跟进线索', module_name: '线索管理', permission_type: 'action', sort_order: 204 },
  { permission_code: 'lead:convert', permission_name: '转化线索', module_name: '线索管理', permission_type: 'action', sort_order: 205 },

  // 客户管理
  { permission_code: 'customer:view', permission_name: '访问客户管理', module_name: '客户管理', permission_type: 'menu', sort_order: 300 },
  { permission_code: 'customer:create', permission_name: '创建客户', module_name: '客户管理', permission_type: 'action', sort_order: 301 },
  { permission_code: 'customer:edit', permission_name: '编辑客户', module_name: '客户管理', permission_type: 'action', sort_order: 302 },
  { permission_code: 'customer:delete', permission_name: '删除客户', module_name: '客户管理', permission_type: 'action', sort_order: 303 },

  // 产品管理
  { permission_code: 'product:view', permission_name: '访问产品管理', module_name: '产品管理', permission_type: 'menu', sort_order: 400 },
  { permission_code: 'product:create', permission_name: '创建产品', module_name: '产品管理', permission_type: 'action', sort_order: 401 },
  { permission_code: 'product:edit', permission_name: '编辑产品', module_name: '产品管理', permission_type: 'action', sort_order: 402 },
  { permission_code: 'product:delete', permission_name: '删除产品', module_name: '产品管理', permission_type: 'action', sort_order: 403 },

  // 报价管理
  { permission_code: 'quotation:view', permission_name: '访问报价管理', module_name: '报价管理', permission_type: 'menu', sort_order: 500 },
  { permission_code: 'quotation:create', permission_name: '创建报价单', module_name: '报价管理', permission_type: 'action', sort_order: 501 },
  { permission_code: 'quotation:edit', permission_name: '编辑报价单', module_name: '报价管理', permission_type: 'action', sort_order: 502 },
  { permission_code: 'quotation:delete', permission_name: '删除报价单', module_name: '报价管理', permission_type: 'action', sort_order: 503 },
  { permission_code: 'quotation:approve', permission_name: '审批报价单', module_name: '报价管理', permission_type: 'action', sort_order: 504 },

  // 合同管理
  { permission_code: 'contract:view', permission_name: '访问合同管理', module_name: '合同管理', permission_type: 'menu', sort_order: 600 },
  { permission_code: 'contract:create', permission_name: '创建合同', module_name: '合同管理', permission_type: 'action', sort_order: 601 },
  { permission_code: 'contract:edit', permission_name: '编辑合同', module_name: '合同管理', permission_type: 'action', sort_order: 602 },
  { permission_code: 'contract:delete', permission_name: '删除合同', module_name: '合同管理', permission_type: 'action', sort_order: 603 },
  { permission_code: 'contract:approve', permission_name: '审批合同', module_name: '合同管理', permission_type: 'action', sort_order: 604 },

  // 发货管理
  { permission_code: 'shipment:view', permission_name: '访问发货管理', module_name: '发货管理', permission_type: 'menu', sort_order: 700 },
  { permission_code: 'shipment:create', permission_name: '创建发货单', module_name: '发货管理', permission_type: 'action', sort_order: 701 },
  { permission_code: 'shipment:edit', permission_name: '编辑发货单', module_name: '发货管理', permission_type: 'action', sort_order: 702 },
  { permission_code: 'shipment:delete', permission_name: '删除发货单', module_name: '发货管理', permission_type: 'action', sort_order: 703 },

  // 收款管理
  { permission_code: 'payment:view', permission_name: '访问收款管理', module_name: '收款管理', permission_type: 'menu', sort_order: 800 },
  { permission_code: 'payment:create', permission_name: '创建收款记录', module_name: '收款管理', permission_type: 'action', sort_order: 801 },
  { permission_code: 'payment:edit', permission_name: '编辑收款记录', module_name: '收款管理', permission_type: 'action', sort_order: 802 },
  { permission_code: 'payment:delete', permission_name: '删除收款记录', module_name: '收款管理', permission_type: 'action', sort_order: 803 },

  // 发票管理
  { permission_code: 'invoice:view', permission_name: '访问发票管理', module_name: '发票管理', permission_type: 'menu', sort_order: 900 },
  { permission_code: 'invoice:create', permission_name: '创建发票', module_name: '发票管理', permission_type: 'action', sort_order: 901 },
  { permission_code: 'invoice:edit', permission_name: '编辑发票', module_name: '发票管理', permission_type: 'action', sort_order: 902 },
  { permission_code: 'invoice:delete', permission_name: '删除发票', module_name: '发票管理', permission_type: 'action', sort_order: 903 },

  // 售后管理
  { permission_code: 'service:view', permission_name: '访问售后管理', module_name: '售后管理', permission_type: 'menu', sort_order: 1000 },
  { permission_code: 'service:create', permission_name: '创建工单', module_name: '售后管理', permission_type: 'action', sort_order: 1001 },
  { permission_code: 'service:edit', permission_name: '编辑工单', module_name: '售后管理', permission_type: 'action', sort_order: 1002 },
  { permission_code: 'service:delete', permission_name: '删除工单', module_name: '售后管理', permission_type: 'action', sort_order: 1003 },
  { permission_code: 'service:process', permission_name: '处理工单', module_name: '售后管理', permission_type: 'action', sort_order: 1004 },

  // 任务中心
  { permission_code: 'task:view', permission_name: '访问任务中心', module_name: '任务中心', permission_type: 'menu', sort_order: 1100 },
  { permission_code: 'task:create', permission_name: '创建任务', module_name: '任务中心', permission_type: 'action', sort_order: 1101 },
  { permission_code: 'task:edit', permission_name: '编辑任务', module_name: '任务中心', permission_type: 'action', sort_order: 1102 },
  { permission_code: 'task:delete', permission_name: '删除任务', module_name: '任务中心', permission_type: 'action', sort_order: 1103 },

  // 系统设置
  { permission_code: 'system:view', permission_name: '访问系统设置', module_name: '系统设置', permission_type: 'menu', sort_order: 1200 },
  { permission_code: 'system:user:view', permission_name: '查看用户', module_name: '系统设置', permission_type: 'action', sort_order: 1201 },
  { permission_code: 'system:user:create', permission_name: '创建用户', module_name: '系统设置', permission_type: 'action', sort_order: 1202 },
  { permission_code: 'system:user:edit', permission_name: '编辑用户', module_name: '系统设置', permission_type: 'action', sort_order: 1203 },
  { permission_code: 'system:user:delete', permission_name: '删除用户', module_name: '系统设置', permission_type: 'action', sort_order: 1204 },
  { permission_code: 'system:role:view', permission_name: '查看角色', module_name: '系统设置', permission_type: 'action', sort_order: 1205 },
  { permission_code: 'system:role:create', permission_name: '创建角色', module_name: '系统设置', permission_type: 'action', sort_order: 1206 },
  { permission_code: 'system:role:edit', permission_name: '编辑角色', module_name: '系统设置', permission_type: 'action', sort_order: 1207 },
  { permission_code: 'system:role:delete', permission_name: '删除角色', module_name: '系统设置', permission_type: 'action', sort_order: 1208 },
  { permission_code: 'system:params', permission_name: '系统参数设置', module_name: '系统设置', permission_type: 'action', sort_order: 1209 },
];

// 获取权限列表（树形结构）
exports.getPermissionTree = async (req, res) => {
  try {
    // 先确保权限数据已初始化
    await initPermissions();

    const permissions = await Permission.findAll({
      order: [['sort_order', 'ASC']]
    });

    // 按模块分组，构建树形结构
    const moduleMap = new Map();
    permissions.forEach(p => {
      const pData = p.toJSON();
      if (!moduleMap.has(pData.module_name)) {
        moduleMap.set(pData.module_name, {
          id: `module_${pData.module_name}`,
          label: pData.module_name,
          children: []
        });
      }
      moduleMap.get(pData.module_name).children.push({
        id: pData.permission_id,
        label: pData.permission_name,
        permission_code: pData.permission_code,
        permission_type: pData.permission_type
      });
    });

    const tree = Array.from(moduleMap.values());
    return success(res, tree, '获取成功');
  } catch (err) {
    console.error('获取权限树错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '获取失败', 500);
  }
};

// 获取权限列表（平铺）
exports.getPermissionList = async (req, res) => {
  try {
    // 先确保权限数据已初始化
    await initPermissions();

    const permissions = await Permission.findAll({
      order: [['sort_order', 'ASC']]
    });

    return success(res, permissions, '获取成功');
  } catch (err) {
    console.error('获取权限列表错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '获取失败', 500);
  }
};

// 初始化权限数据
async function initPermissions() {
  try {
    const count = await Permission.count();
    if (count === 0) {
      console.log('初始化权限数据...');
      await Permission.bulkCreate(PREDEFINED_PERMISSIONS);
      console.log(`成功创建 ${PREDEFINED_PERMISSIONS.length} 条权限记录`);
    }
  } catch (err) {
    console.error('初始化权限数据错误:', err);
    throw err;
  }
}

module.exports.initPermissions = initPermissions;
