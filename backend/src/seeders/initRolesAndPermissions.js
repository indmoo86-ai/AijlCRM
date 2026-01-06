/**
 * 初始化角色和权限数据
 * 运行: node src/seeders/initRolesAndPermissions.js
 */

const { sequelize } = require('../config/database');
const { Role, Permission, RolePermission, User, UserRole } = require('../models');

// 预定义角色
const PREDEFINED_ROLES = [
  {
    role_code: 'admin',
    role_name: '系统管理员',
    description: '拥有系统所有权限',
    is_system: 1,
    sort_order: 0
  },
  {
    role_code: 'manager',
    role_name: '销售经理',
    description: '管理销售团队和业务数据',
    is_system: 1,
    sort_order: 10
  },
  {
    role_code: 'sales',
    role_name: '销售人员',
    description: '负责线索跟进和客户维护',
    is_system: 1,
    sort_order: 20
  },
  {
    role_code: 'finance',
    role_name: '财务人员',
    description: '负责收款和发票管理',
    is_system: 1,
    sort_order: 30
  },
  {
    role_code: 'support',
    role_name: '售后人员',
    description: '负责售后工单处理',
    is_system: 1,
    sort_order: 40
  }
];

// 预定义权限
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

// 角色默认权限配置
const ROLE_PERMISSIONS = {
  // 销售经理 - 拥有除系统设置外的大部分权限
  manager: [
    'dashboard:view',
    'lead:view', 'lead:create', 'lead:edit', 'lead:delete', 'lead:follow', 'lead:convert',
    'customer:view', 'customer:create', 'customer:edit', 'customer:delete',
    'product:view',
    'quotation:view', 'quotation:create', 'quotation:edit', 'quotation:delete', 'quotation:approve',
    'contract:view', 'contract:create', 'contract:edit', 'contract:approve',
    'shipment:view', 'shipment:create',
    'payment:view', 'payment:create',
    'invoice:view',
    'service:view',
    'task:view', 'task:create', 'task:edit'
  ],
  // 销售人员 - 基本的销售功能
  sales: [
    'dashboard:view',
    'lead:view', 'lead:create', 'lead:edit', 'lead:follow', 'lead:convert',
    'customer:view', 'customer:create', 'customer:edit',
    'product:view',
    'quotation:view', 'quotation:create', 'quotation:edit',
    'contract:view', 'contract:create',
    'service:view', 'service:create',
    'task:view', 'task:create'
  ],
  // 财务人员 - 财务相关功能
  finance: [
    'dashboard:view',
    'customer:view',
    'contract:view',
    'payment:view', 'payment:create', 'payment:edit',
    'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:delete',
    'task:view'
  ],
  // 售后人员 - 售后相关功能
  support: [
    'dashboard:view',
    'customer:view',
    'contract:view',
    'product:view',
    'service:view', 'service:create', 'service:edit', 'service:process',
    'task:view', 'task:create'
  ]
};

async function initRolesAndPermissions() {
  try {
    console.log('开始初始化角色和权限数据...\n');

    // 1. 初始化权限
    console.log('1. 初始化权限数据...');
    const existingPermissions = await Permission.count();
    if (existingPermissions === 0) {
      await Permission.bulkCreate(PREDEFINED_PERMISSIONS);
      console.log(`   创建了 ${PREDEFINED_PERMISSIONS.length} 条权限记录`);
    } else {
      console.log(`   权限数据已存在 (${existingPermissions} 条)`);
    }

    // 2. 初始化角色
    console.log('\n2. 初始化角色数据...');
    for (const roleData of PREDEFINED_ROLES) {
      const [role, created] = await Role.findOrCreate({
        where: { role_code: roleData.role_code },
        defaults: roleData
      });
      if (created) {
        console.log(`   创建角色: ${roleData.role_name}`);
      } else {
        console.log(`   角色已存在: ${roleData.role_name}`);
      }
    }

    // 3. 为角色分配默认权限
    console.log('\n3. 分配角色权限...');
    const allPermissions = await Permission.findAll();
    const permissionMap = {};
    allPermissions.forEach(p => {
      permissionMap[p.permission_code] = p.permission_id;
    });

    for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await Role.findOne({ where: { role_code: roleCode } });
      if (!role) continue;

      // 检查是否已有权限配置
      const existingRolePermissions = await RolePermission.count({ where: { role_id: role.role_id } });
      if (existingRolePermissions > 0) {
        console.log(`   角色 ${role.role_name} 已有权限配置 (${existingRolePermissions} 条)`);
        continue;
      }

      // 创建权限配置
      const rolePermissions = permissionCodes
        .filter(code => permissionMap[code])
        .map(code => ({
          role_id: role.role_id,
          permission_id: permissionMap[code],
          creator_id: 1
        }));

      if (rolePermissions.length > 0) {
        await RolePermission.bulkCreate(rolePermissions);
        console.log(`   为角色 ${role.role_name} 分配了 ${rolePermissions.length} 个权限`);
      }
    }

    // 4. 确保admin用户有管理员角色
    console.log('\n4. 检查管理员用户...');
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    const adminRole = await Role.findOne({ where: { role_code: 'admin' } });

    if (adminUser && adminRole) {
      const [userRole, created] = await UserRole.findOrCreate({
        where: {
          user_id: adminUser.id,
          role_id: adminRole.role_id
        },
        defaults: {
          user_id: adminUser.id,
          role_id: adminRole.role_id,
          creator_id: adminUser.id
        }
      });

      if (created) {
        console.log('   为admin用户分配了管理员角色');
      } else {
        console.log('   admin用户已有管理员角色');
      }

      // 更新User表中的role字段为6（管理员）
      if (adminUser.role !== 6) {
        await adminUser.update({ role: 6 });
        console.log('   更新admin用户role字段为6（管理员）');
      }
    } else {
      console.log('   警告: 未找到admin用户或管理员角色');
    }

    console.log('\n初始化完成！');

  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initRolesAndPermissions()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initRolesAndPermissions;
