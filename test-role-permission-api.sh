#!/bin/bash

# 艾居来CRM - 角色权限管理API测试脚本
# 测试时间: $(date '+%Y-%m-%d %H:%M:%S')

BASE_URL="http://localhost:3000/api"
TOKEN=""
TEST_ROLE_ID=""
TIMESTAMP=$(date +%s)

echo "=================================="
echo "角色权限管理 API 测试"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试结果记录函数
test_result() {
    local test_name=$1
    local result=$2
    local details=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$result" == "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}✗ FAIL${NC} - $test_name"
        if [ -n "$details" ]; then
            echo -e "  ${YELLOW}详情:${NC} $details"
        fi
    fi
}

# 1. 用户登录
echo "=================================="
echo "测试 1: 用户登录"
echo "=================================="

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }')

echo "登录响应: $LOGIN_RESPONSE"
echo ""

# 提取token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    test_result "用户登录成功" "PASS"
    echo "Token: ${TOKEN:0:20}..."
else
    test_result "用户登录失败" "FAIL" "未获取到有效token"
    echo "无法继续后续测试"
    exit 1
fi
echo ""

# 2. 获取角色列表
echo "=================================="
echo "测试 2: 获取角色列表"
echo "=================================="

ROLES_RESPONSE=$(curl -s -X GET "$BASE_URL/settings/roles" \
  -H "Authorization: Bearer $TOKEN")

echo "角色列表响应: $ROLES_RESPONSE"
echo ""

if echo "$ROLES_RESPONSE" | grep -q '"success":true'; then
    test_result "获取角色列表成功" "PASS"
else
    test_result "获取角色列表失败" "FAIL" "$ROLES_RESPONSE"
fi
echo ""

# 3. 获取权限树
echo "=================================="
echo "测试 3: 获取权限树"
echo "=================================="

PERMISSIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/settings/permissions" \
  -H "Authorization: Bearer $TOKEN")

echo "权限树响应: $PERMISSIONS_RESPONSE"
echo ""

if echo "$PERMISSIONS_RESPONSE" | grep -q '"success":true'; then
    test_result "获取权限树成功" "PASS"
else
    test_result "获取权限树失败" "FAIL" "$PERMISSIONS_RESPONSE"
fi
echo ""

# 4. 创建新角色
echo "=================================="
echo "测试 4: 创建新角色"
echo "=================================="

CREATE_ROLE_RESPONSE=$(curl -s -X POST "$BASE_URL/settings/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"role_name\": \"测试角色_${TIMESTAMP}\",
    \"role_code\": \"test_role_${TIMESTAMP}\",
    \"description\": \"这是一个API测试创建的角色\",
    \"status\": 1
  }")

echo "创建角色响应: $CREATE_ROLE_RESPONSE"
echo ""

# 提取角色ID
TEST_ROLE_ID=$(echo $CREATE_ROLE_RESPONSE | grep -o '"role_id":[0-9]*' | head -1 | sed 's/"role_id"://')

if [ -n "$TEST_ROLE_ID" ] && [ "$TEST_ROLE_ID" != "null" ]; then
    test_result "创建角色成功" "PASS"
    echo "新角色ID: $TEST_ROLE_ID"
else
    test_result "创建角色失败" "FAIL" "$CREATE_ROLE_RESPONSE"
    TEST_ROLE_ID=1  # 使用默认ID继续测试
fi
echo ""

# 5. 获取角色详情
echo "=================================="
echo "测试 5: 获取角色详情"
echo "=================================="

ROLE_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/settings/roles/$TEST_ROLE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "角色详情响应: $ROLE_DETAIL_RESPONSE"
echo ""

if echo "$ROLE_DETAIL_RESPONSE" | grep -q '"success":true'; then
    test_result "获取角色详情成功" "PASS"
else
    test_result "获取角色详情失败" "FAIL" "$ROLE_DETAIL_RESPONSE"
fi
echo ""

# 6. 更新角色信息
echo "=================================="
echo "测试 6: 更新角色信息"
echo "=================================="

UPDATE_ROLE_RESPONSE=$(curl -s -X PUT "$BASE_URL/settings/roles/$TEST_ROLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"role_name\": \"测试角色_${TIMESTAMP}_已更新\",
    \"description\": \"这是一个已更新的测试角色\"
  }")

echo "更新角色响应: $UPDATE_ROLE_RESPONSE"
echo ""

if echo "$UPDATE_ROLE_RESPONSE" | grep -q '"success":true'; then
    test_result "更新角色成功" "PASS"
else
    test_result "更新角色失败" "FAIL" "$UPDATE_ROLE_RESPONSE"
fi
echo ""

# 7. 配置角色权限
echo "=================================="
echo "测试 7: 配置角色权限"
echo "=================================="

ASSIGN_PERMISSIONS_RESPONSE=$(curl -s -X PUT "$BASE_URL/settings/roles/$TEST_ROLE_ID/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": [1, 2, 3, 4, 5]
  }')

echo "配置权限响应: $ASSIGN_PERMISSIONS_RESPONSE"
echo ""

if echo "$ASSIGN_PERMISSIONS_RESPONSE" | grep -q '"success":true'; then
    test_result "配置角色权限成功" "PASS"
else
    test_result "配置角色权限失败" "FAIL" "$ASSIGN_PERMISSIONS_RESPONSE"
fi
echo ""

# 8. 获取用户列表
echo "=================================="
echo "测试 8: 获取用户列表"
echo "=================================="

USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/settings/users" \
  -H "Authorization: Bearer $TOKEN")

echo "用户列表响应: $USERS_RESPONSE"
echo ""

if echo "$USERS_RESPONSE" | grep -q '"success":true'; then
    test_result "获取用户列表成功" "PASS"
else
    test_result "获取用户列表失败" "FAIL" "$USERS_RESPONSE"
fi
echo ""

# 9. 创建新用户
echo "=================================="
echo "测试 9: 创建新用户"
echo "=================================="

CREATE_USER_RESPONSE=$(curl -s -X POST "$BASE_URL/settings/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser_${TIMESTAMP}\",
    \"password\": \"Test123456\",
    \"name\": \"测试用户_${TIMESTAMP}\",
    \"phone\": \"13800138000\",
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"department\": \"测试部门\",
    \"status\": 1
  }")

echo "创建用户响应: $CREATE_USER_RESPONSE"
echo ""

TEST_USER_ID=$(echo $CREATE_USER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -n "$TEST_USER_ID" ] && [ "$TEST_USER_ID" != "null" ]; then
    test_result "创建用户成功" "PASS"
    echo "新用户ID: $TEST_USER_ID"
else
    test_result "创建用户失败" "FAIL" "$CREATE_USER_RESPONSE"
    TEST_USER_ID=1
fi
echo ""

# 10. 为用户分配角色
echo "=================================="
echo "测试 10: 为用户分配角色"
echo "=================================="

ASSIGN_ROLES_RESPONSE=$(curl -s -X PUT "$BASE_URL/settings/users/$TEST_USER_ID/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"role_ids\": [$TEST_ROLE_ID]
  }")

echo "分配角色响应: $ASSIGN_ROLES_RESPONSE"
echo ""

if echo "$ASSIGN_ROLES_RESPONSE" | grep -q '"success":true'; then
    test_result "为用户分配角色成功" "PASS"
else
    test_result "为用户分配角色失败" "FAIL" "$ASSIGN_ROLES_RESPONSE"
fi
echo ""

# 11. 获取用户详情（验证角色已分配）
echo "=================================="
echo "测试 11: 获取用户详情"
echo "=================================="

USER_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/settings/users/$TEST_USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "用户详情响应: $USER_DETAIL_RESPONSE"
echo ""

if echo "$USER_DETAIL_RESPONSE" | grep -q '"success":true'; then
    test_result "获取用户详情成功" "PASS"
else
    test_result "获取用户详情失败" "FAIL" "$USER_DETAIL_RESPONSE"
fi
echo ""

# 12. 删除测试用户（清理）
echo "=================================="
echo "测试 12: 删除测试用户"
echo "=================================="

DELETE_USER_RESPONSE=$(curl -s -X DELETE "$BASE_URL/settings/users/$TEST_USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "删除用户响应: $DELETE_USER_RESPONSE"
echo ""

if echo "$DELETE_USER_RESPONSE" | grep -q '"success":true'; then
    test_result "删除用户成功" "PASS"
else
    test_result "删除用户失败" "FAIL" "$DELETE_USER_RESPONSE"
fi
echo ""

# 13. 删除测试角色（清理）
echo "=================================="
echo "测试 13: 删除测试角色"
echo "=================================="

DELETE_ROLE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/settings/roles/$TEST_ROLE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "删除角色响应: $DELETE_ROLE_RESPONSE"
echo ""

if echo "$DELETE_ROLE_RESPONSE" | grep -q '"success":true'; then
    test_result "删除角色成功" "PASS"
else
    test_result "删除角色失败" "FAIL" "$DELETE_ROLE_RESPONSE"
fi
echo ""

# 测试总结
echo "=================================="
echo "测试总结"
echo "=================================="
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo "通过率: $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！✓${NC}"
    exit 0
else
    echo -e "${RED}部分测试失败，请检查详细日志${NC}"
    exit 1
fi
