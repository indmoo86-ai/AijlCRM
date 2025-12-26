<template>
  <div class="lead-detail">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>线索详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="线索编号">LD-20251225-001</el-descriptions-item>
        <el-descriptions-item label="客户名称">测试酒店集团</el-descriptions-item>
        <el-descriptions-item label="酒店名称">测试豪华酒店</el-descriptions-item>
        <el-descriptions-item label="城市">深圳市</el-descriptions-item>
        <el-descriptions-item label="房间数量">200</el-descriptions-item>
        <el-descriptions-item label="联系电话">13800138000</el-descriptions-item>
        <el-descriptions-item label="意向程度">
          <el-tag type="danger">高</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="来源渠道">官网咨询</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
// 线索详情页（功能待完善）
</script>

<style scoped>
.lead-detail {
  padding: 0;
}
</style>
