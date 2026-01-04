<template>
  <div class="leads-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>线索管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建线索
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="意向程度">
          <el-select
            v-model="searchForm.intentionLevel"
            placeholder="请选择"
            clearable
            style="width: 100px"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
            <el-option label="无" value="none" />
          </el-select>
        </el-form-item>

        <el-form-item label="预警状态">
          <el-select
            v-model="searchForm.warningLevel"
            placeholder="请选择"
            clearable
            style="width: 100px"
          >
            <el-option label="正常" :value="0">
              <span class="warning-option">
                <span class="warning-dot warning-green"></span>
                正常
              </span>
            </el-option>
            <el-option label="预警" :value="1">
              <span class="warning-option">
                <span class="warning-dot warning-orange"></span>
                预警
              </span>
            </el-option>
            <el-option label="逾期" :value="2">
              <span class="warning-option">
                <span class="warning-dot warning-red"></span>
                逾期
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="显示全部">
          <el-switch v-model="searchForm.showAll" @change="handleSearch" />
        </el-form-item>

        <el-form-item label="需求分类">
          <el-select
            v-model="searchForm.demandCategory"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="无人酒店" value="unmanned_hotel" />
            <el-option label="自助入住" value="self_checkin" />
            <el-option label="智能客控" value="smart_room_control" />
            <el-option label="送货机器人" value="delivery_robot" />
            <el-option label="酒管系统" value="pms" />
            <el-option label="酒店门锁" value="hotel_lock" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户经理">
          <el-select
            v-model="searchForm.salesOwnerId"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="地区">
          <el-cascader
            v-model="searchForm.regionCode"
            :options="chinaRegionOptions"
            :props="{ expandTrigger: 'hover', checkStrictly: true }"
            placeholder="请选择"
            style="width: 200px"
            filterable
            clearable
            @change="handleSearchRegionChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="leadNo" label="线索编号" width="140">
          <template #default="{ row }">
            <div class="lead-no-cell">
              <span
                class="warning-indicator"
                :class="{
                  'warning-green': row.warningLevel === 0,
                  'warning-orange': row.warningLevel === 1,
                  'warning-red': row.warningLevel === 2
                }"
              ></span>
              {{ row.leadNo }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客户名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="hotelName" label="酒店名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="地区" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatRegion(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="roomCount" label="房间数" width="65" />
        <el-table-column prop="phone" label="联系电话" width="115" />

        <el-table-column prop="intentionLevel" label="意向" width="55">
          <template #default="{ row }">
            <el-tag v-if="row.intentionLevel === 'high'" type="danger" size="small">高</el-tag>
            <el-tag v-else-if="row.intentionLevel === 'medium'" type="warning" size="small">中</el-tag>
            <el-tag v-else-if="row.intentionLevel === 'low'" type="info" size="small">低</el-tag>
            <el-tag v-else-if="row.intentionLevel === 'none'" size="small">无</el-tag>
            <el-tag v-else type="info" size="small">-</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="demandCategories" label="需求分类" min-width="150">
          <template #default="{ row }">
            <template v-if="row.demandCategories">
              <el-tag
                v-for="cat in parseDemandCategories(row.demandCategories)"
                :key="cat"
                size="small"
                style="margin-right: 4px; margin-bottom: 2px;"
              >
                {{ getDemandCategoryLabel(cat) }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="客户经理" width="80">
          <template #default="{ row }">
            {{ row.salesOwner?.name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="channelSource" label="来源" width="70">
          <template #default="{ row }">
            {{ getChannelSourceLabel(row.channelSource) }}
          </template>
        </el-table-column>

        <el-table-column label="最新跟踪" min-width="270">
          <template #default="{ row }">
            <div v-if="row.latestFollowUp" class="latest-followup-cell">
              <div class="followup-content-preview">
                {{ truncateText(row.latestFollowUp.content, 50) }}
              </div>
              <div class="followup-meta">
                <span class="followup-operator">{{ row.latestFollowUp.operator?.name || '-' }}</span>
                <span class="followup-time">{{ formatDateTime(row.latestFollowUp.created_at) }}</span>
              </div>
            </div>
            <span v-else class="no-followup">暂无跟踪</span>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="95">
          <template #default="{ row }">
            {{ formatDate(row.created_at || row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="success" size="small" @click="handleFollowUp(row)">
                跟踪
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end;"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 新建/编辑线索对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      style="max-width: 1200px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <!-- 第一行：客户名称、联系电话、微信 -->
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="微信" prop="wechat">
              <el-input v-model="form.wechat" placeholder="请输入微信号" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：酒店名称、房间数量 -->
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="酒店名称" prop="hotelName">
              <el-input v-model="form.hotelName" placeholder="请输入酒店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="房间数量" prop="roomCount">
              <el-input-number
                v-model="form.roomCount"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：所在地区 -->
        <el-form-item label="所在地区" prop="province" required>
          <el-row :gutter="10" style="width: 100%">
            <el-col :span="6">
              <el-select
                v-model="form.regionType"
                placeholder="地区类型"
                style="width: 100%"
                @change="handleRegionTypeChange"
              >
                <el-option label="中国大陆" value="china" />
                <el-option label="海外" value="overseas" />
              </el-select>
            </el-col>
            <el-col :span="18">
              <!-- 中国大陆：省市区三级联动 -->
              <el-cascader
                v-if="form.regionType === 'china'"
                v-model="form.regionCode"
                :options="chinaRegionOptions"
                :props="{ expandTrigger: 'hover' }"
                placeholder="请选择省/市/区"
                style="width: 100%"
                filterable
                clearable
                @change="handleChinaRegionChange"
              />
              <!-- 海外：大洲、国家二级联动 -->
              <el-cascader
                v-else
                v-model="form.overseasCode"
                :options="overseasOptions"
                :props="{ expandTrigger: 'hover' }"
                placeholder="请选择大洲/国家"
                style="width: 100%"
                filterable
                clearable
                @change="handleOverseasRegionChange"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 第四行：来源渠道、客户经理、意向程度 -->
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="来源渠道" prop="channelSource">
              <el-select v-model="form.channelSource" placeholder="请选择" style="width: 100%">
                <el-option label="官网咨询" value="website" />
                <el-option label="微信公众号" value="wechat" />
                <el-option label="电话咨询" value="phone" />
                <el-option label="展会" value="exhibition" />
                <el-option label="客户转介绍" value="referral" />
                <el-option label="抖音" value="douyin" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户经理" prop="salesOwnerId">
              <el-select
                v-model="form.salesOwnerId"
                placeholder="请选择客户经理"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="意向程度" prop="intentionLevel">
              <el-select v-model="form.intentionLevel" placeholder="请选择" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
                <el-option label="无" value="none" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行：需求分类（占满一行） -->
        <el-form-item label="需求分类" prop="demandCategories">
          <el-select
            v-model="form.demandCategories"
            multiple
            placeholder="请选择（可多选）"
            style="width: 100%"
          >
            <el-option label="无人酒店" value="unmanned_hotel" />
            <el-option label="自助入住" value="self_checkin" />
            <el-option label="智能客控" value="smart_room_control" />
            <el-option label="送货机器人" value="delivery_robot" />
            <el-option label="酒管系统" value="pms" />
            <el-option label="酒店门锁" value="hotel_lock" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <!-- 第六行：需求描述 -->
        <el-form-item label="需求描述" prop="requirement">
          <el-input
            v-model="form.requirement"
            type="textarea"
            :rows="3"
            placeholder="请输入需求描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 跟踪对话框 -->
    <el-dialog
      v-model="followUpDialogVisible"
      title="添加跟踪记录"
      width="700px"
      @close="resetFollowUpForm"
    >
      <el-form
        ref="followUpFormRef"
        :model="followUpForm"
        :rules="followUpFormRules"
        label-width="100px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="跟踪时间" prop="followTime">
              <el-date-picker
                v-model="followUpForm.followTime"
                type="datetime"
                placeholder="选择跟踪时间"
                style="width: 100%"
                :default-time="new Date()"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作人">
              <el-input :value="currentUser?.name || '当前用户'" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="意向级别" prop="intentionLevel">
              <el-select v-model="followUpForm.intentionLevel" placeholder="请选择" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
                <el-option label="无" value="none" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次跟进">
              <el-date-picker
                v-model="followUpForm.nextFollowDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                :disabled-date="disablePastDates"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="需求分类">
          <el-select
            v-model="followUpForm.demandCategories"
            multiple
            placeholder="请选择（可多选）"
            style="width: 100%"
          >
            <el-option label="无人酒店" value="unmanned_hotel" />
            <el-option label="自助入住" value="self_checkin" />
            <el-option label="智能客控" value="smart_room_control" />
            <el-option label="送货机器人" value="delivery_robot" />
            <el-option label="酒管系统" value="pms" />
            <el-option label="酒店门锁" value="hotel_lock" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="跟踪备注" prop="content">
          <el-input
            v-model="followUpForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟踪备注"
          />
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
            ref="uploadRef"
            v-model:file-list="followUpForm.fileList"
            action="#"
            :auto-upload="false"
            :limit="5"
            :on-exceed="handleExceed"
          >
            <el-button type="primary" plain>
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                最多上传5个文件（demo版本，暂不上传至服务器）
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="followUpDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="followUpLoading" @click="handleFollowUpSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="线索详情"
      direction="rtl"
      size="75%"
      :destroy-on-close="true"
    >
      <div v-loading="detailLoading" class="detail-drawer">
        <!-- 时间提醒 -->
        <div v-if="detailData.timeReminders && detailData.timeReminders.length > 0" class="time-reminders">
          <el-alert
            v-for="(reminder, idx) in detailData.timeReminders"
            :key="idx"
            :title="reminder.message"
            :type="reminder.type === 'overdue' ? 'error' : reminder.type === 'today' ? 'warning' : 'info'"
            :closable="false"
            show-icon
            style="margin-bottom: 8px;"
          />
        </div>

        <el-tabs v-if="detailData.lead" v-model="detailActiveTab">
          <!-- 基础详情 Tab -->
          <el-tab-pane label="基础详情" name="basic">
            <div class="detail-section">
              <div class="section-header">
                <div class="section-title">线索信息</div>
                <el-button type="primary" size="small" @click="handleEditFromDetail">
                  编辑
                </el-button>
              </div>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="线索编号">{{ detailData.lead?.leadNo || '-' }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusType(detailData.lead?.status)" size="small">
                    {{ getStatusLabel(detailData.lead?.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="客户名称">{{ detailData.lead?.customerName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="酒店名称">{{ detailData.lead?.hotelName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ detailData.lead?.phone || '-' }}</el-descriptions-item>
                <el-descriptions-item label="微信">{{ detailData.lead?.wechat || '-' }}</el-descriptions-item>
                <el-descriptions-item label="所在地区" :span="2">
                  {{ formatRegion(detailData.lead) }}
                </el-descriptions-item>
                <el-descriptions-item label="房间数">{{ detailData.lead?.roomCount || '-' }}</el-descriptions-item>
                <el-descriptions-item label="来源渠道">{{ getChannelSourceLabel(detailData.lead?.channelSource) }}</el-descriptions-item>
                <el-descriptions-item label="意向程度">
                  <el-tag :type="getIntentionType(detailData.lead?.intentionLevel)" size="small">
                    {{ getIntentionLabel(detailData.lead?.intentionLevel) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="客户经理">{{ detailData.lead?.salesOwner?.name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="需求分类" :span="2">
                  <template v-if="detailData.lead?.demandCategories">
                    <el-tag
                      v-for="cat in parseDemandCategories(detailData.lead.demandCategories)"
                      :key="cat"
                      size="small"
                      style="margin-right: 4px;"
                    >
                      {{ getDemandCategoryLabel(cat) }}
                    </el-tag>
                  </template>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="需求描述" :span="2">{{ detailData.lead?.firstDemand || '-' }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 关联客户 -->
            <div class="detail-section">
              <div class="section-title">关联客户</div>
              <template v-if="detailData.lead?.customer">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="客户编号">{{ detailData.lead.customer.customerNo }}</el-descriptions-item>
                  <el-descriptions-item label="客户类型">
                    <el-tag :type="detailData.lead.customer.customerType === 3 ? 'danger' : detailData.lead.customer.customerType === 2 ? 'success' : 'info'" size="small">
                      {{ detailData.lead.customer.customerType === 3 ? 'VIP' : detailData.lead.customer.customerType === 2 ? '正式' : '潜在' }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="客户名称">{{ detailData.lead.customer.customerName }}</el-descriptions-item>
                  <el-descriptions-item label="联系电话">{{ detailData.lead.customer.phone || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="累计金额">¥{{ detailData.lead.customer.totalAmount || 0 }}</el-descriptions-item>
                  <el-descriptions-item label="合同数量">{{ detailData.lead.customer.contractCount || 0 }}</el-descriptions-item>
                </el-descriptions>
              </template>
              <el-empty v-else description="暂无关联客户" :image-size="60" />
            </div>

            <!-- 关联合同 -->
            <div class="detail-section">
              <div class="section-title">关联合同</div>
              <template v-if="detailData.contracts && detailData.contracts.length > 0">
                <el-table :data="detailData.contracts" size="small" border max-height="200">
                  <el-table-column prop="contract_no" label="合同编号" width="140" />
                  <el-table-column prop="contract_name" label="合同名称" min-width="120" show-overflow-tooltip />
                  <el-table-column prop="total_amount" label="金额" width="100">
                    <template #default="{ row }">¥{{ row.total_amount || 0 }}</template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="80">
                    <template #default="{ row }">
                      <el-tag :type="getContractStatusType(row.status)" size="small">
                        {{ getContractStatusLabel(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
              <el-empty v-else description="暂无关联合同" :image-size="60" />
            </div>

            <!-- 时间信息 -->
            <div class="detail-section">
              <div class="section-title">时间信息</div>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="创建时间">{{ formatDateTime(detailData.lead?.created_at) }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{ detailData.lead?.createdByUser?.name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="最后跟进">{{ formatDateTime(detailData.lead?.lastFollowTime) }}</el-descriptions-item>
                <el-descriptions-item label="下次跟进">
                  <span :class="{ 'text-danger': isOverdue(detailData.lead?.nextFollowDate) }">
                    {{ formatDate(detailData.lead?.nextFollowDate) }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="预期签约">{{ formatDate(detailData.lead?.expectedSignDate) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatDateTime(detailData.lead?.updated_at) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>

          <!-- 跟踪记录 Tab -->
          <el-tab-pane label="跟踪记录" name="followups">
            <div class="followup-header">
              <el-button type="primary" size="small" @click="handleFollowUpFromDetail">
                添加跟踪
              </el-button>
            </div>
            <template v-if="detailData.followUps && detailData.followUps.length > 0">
              <el-timeline>
                <el-timeline-item
                  v-for="item in detailData.followUps"
                  :key="item.id"
                  :timestamp="formatDateTime(item.created_at)"
                  placement="top"
                >
                  <el-card shadow="never" class="followup-card">
                    <div class="followup-header-info">
                      <span class="operator">{{ item.operator?.name || '未知' }}</span>
                      <el-tag v-if="item.intentionLevel" :type="getIntentionType(item.intentionLevel)" size="small">
                        {{ getIntentionLabel(item.intentionLevel) }}
                      </el-tag>
                    </div>
                    <div class="followup-content">{{ item.content }}</div>
                    <div v-if="item.nextFollowDate" class="followup-next">
                      下次跟进：{{ formatDate(item.nextFollowDate) }}
                      <span v-if="item.nextPlan">（{{ item.nextPlan }}）</span>
                    </div>
                    <div v-if="item.attachments && item.attachments.length > 0" class="followup-attachments">
                      附件：
                      <el-tag v-for="(att, idx) in item.attachments" :key="idx" size="small" style="margin-right: 4px;">
                        {{ att.name }}
                      </el-tag>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </template>
            <el-empty v-else description="暂无跟踪记录" />
          </el-tab-pane>

          <!-- 关联报价单 Tab -->
          <el-tab-pane label="关联报价单" name="quotations">
            <div class="quotation-header">
              <el-button type="primary" size="small" @click="handleCreateQuotation">
                创建报价单
              </el-button>
            </div>

            <!-- 最新报价单展示 -->
            <template v-if="latestQuotation">
              <div class="latest-quotation-section">
                <div class="section-title-row">
                  <span class="section-title">最新报价单</span>
                  <el-tag :type="getQuotationStatusType(latestQuotation.status)" size="small">
                    {{ getQuotationStatusLabel(latestQuotation.status) }}
                  </el-tag>
                </div>
                <el-descriptions :column="3" border size="small">
                  <el-descriptions-item label="报价单号">{{ latestQuotation.quotation_no }}</el-descriptions-item>
                  <el-descriptions-item label="版本">V{{ latestQuotation.version || 1 }}</el-descriptions-item>
                  <el-descriptions-item label="报价日期">{{ latestQuotation.quotation_date }}</el-descriptions-item>
                  <el-descriptions-item label="产品数量">{{ latestQuotation.total_quantity || 0 }} 件</el-descriptions-item>
                  <el-descriptions-item label="名义总价">
                    <span>¥{{ formatPrice(latestQuotation.total_sale_price) }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="实际总价">
                    <span class="price-actual">¥{{ formatPrice(latestQuotation.total_amount) }}</span>
                  </el-descriptions-item>
                </el-descriptions>

                <!-- 产品明细 -->
                <div v-if="latestQuotation.items && latestQuotation.items.length > 0" class="quotation-items">
                  <div class="items-title">产品明细</div>
                  <el-table :data="latestQuotation.items" size="small" border max-height="200">
                    <el-table-column prop="product_name" label="产品名称" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="quantity" label="数量" width="70" align="center" />
                    <el-table-column prop="sale_price" label="销售价" width="90" align="right">
                      <template #default="{ row }">¥{{ formatPrice(row.sale_price) }}</template>
                    </el-table-column>
                    <el-table-column prop="unit_price" label="优惠价" width="90" align="right">
                      <template #default="{ row }">¥{{ formatPrice(row.unit_price) }}</template>
                    </el-table-column>
                    <el-table-column prop="subtotal" label="小计" width="100" align="right">
                      <template #default="{ row }">
                        <span class="price-actual">¥{{ formatPrice(row.subtotal) }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <div class="quotation-actions">
                  <el-button size="small" @click="handleViewQuotation(latestQuotation)">查看详情</el-button>
                  <el-button type="primary" size="small" @click="handleExportQuotationPDF(latestQuotation)">导出PDF</el-button>
                  <el-button type="success" size="small" @click="handleExportQuotationExcel(latestQuotation)">导出Excel</el-button>
                  <el-button v-if="latestQuotation.status !== 'voided'" type="warning" size="small" @click="handleReviseQuotation(latestQuotation)">修改</el-button>
                  <el-button v-if="latestQuotation.status !== 'voided' && latestQuotation.status !== 'rejected'" type="danger" size="small" @click="handleCreateContract(latestQuotation)">创建合同</el-button>
                </div>
              </div>
            </template>

            <!-- 历史报价单列表 -->
            <template v-if="detailData.quotations && detailData.quotations.length > 1">
              <div class="history-quotations">
                <div class="section-title">历史报价单</div>
                <el-table :data="historyQuotations" size="small" border>
                  <el-table-column prop="quotation_no" label="报价单号" width="140" />
                  <el-table-column prop="version" label="版本" width="60" align="center">
                    <template #default="{ row }">V{{ row.version || 1 }}</template>
                  </el-table-column>
                  <el-table-column prop="total_sale_price" label="名义总价" width="100" align="right">
                    <template #default="{ row }">¥{{ formatPrice(row.total_sale_price) }}</template>
                  </el-table-column>
                  <el-table-column prop="total_amount" label="实际总价" width="100" align="right">
                    <template #default="{ row }">
                      <span class="price-actual">¥{{ formatPrice(row.total_amount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="80">
                    <template #default="{ row }">
                      <el-tag :type="getQuotationStatusType(row.status)" size="small">
                        {{ getQuotationStatusLabel(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="created_at" label="创建时间" width="100">
                    <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
                  </el-table-column>
                </el-table>
              </div>
            </template>

            <el-empty v-if="!detailData.quotations || detailData.quotations.length === 0" description="暂无关联报价单" />
          </el-tab-pane>

          <!-- 关联合同 Tab -->
          <el-tab-pane label="关联合同" name="contracts">
            <template v-if="detailData.contracts && detailData.contracts.length > 0">
              <!-- 最新合同展示 -->
              <div v-if="latestContract" class="latest-contract-section">
                <div class="section-title-row">
                  <span class="section-title">最新合同</span>
                  <el-tag :type="getContractStatusType(latestContract.status)" size="small">
                    {{ getContractStatusLabel(latestContract.status) }}
                  </el-tag>
                </div>
                <el-descriptions :column="3" border size="small">
                  <el-descriptions-item label="合同编号">{{ latestContract.contract_no }}</el-descriptions-item>
                  <el-descriptions-item label="合同标题">{{ latestContract.contract_title || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="签订日期">{{ latestContract.signed_date || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="合同金额">
                    <span class="price-actual">¥{{ formatPrice(latestContract.contract_amount) }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="金额大写">{{ latestContract.amount_in_words || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="负责人">{{ latestContract.owner?.name || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="酒店名称">{{ latestContract.hotel_name || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="房间数量">{{ latestContract.room_count || '-' }} 间</el-descriptions-item>
                  <el-descriptions-item label="交付期限">{{ latestContract.delivery_deadline || '-' }}</el-descriptions-item>
                </el-descriptions>

                <!-- 产品明细 -->
                <div v-if="latestContract.items && latestContract.items.length > 0" class="contract-items">
                  <div class="items-title">产品明细</div>
                  <el-table :data="latestContract.items" size="small" border max-height="200">
                    <el-table-column prop="product_name" label="产品名称" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="specification" label="规格" width="100" show-overflow-tooltip />
                    <el-table-column prop="quantity" label="数量" width="70" align="center" />
                    <el-table-column prop="product_unit" label="单位" width="60" align="center" />
                    <el-table-column prop="unit_price" label="单价" width="90" align="right">
                      <template #default="{ row }">¥{{ formatPrice(row.unit_price) }}</template>
                    </el-table-column>
                    <el-table-column prop="subtotal" label="小计" width="100" align="right">
                      <template #default="{ row }">
                        <span class="price-actual">¥{{ formatPrice(row.subtotal) }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <div class="contract-actions">
                  <el-button size="small" @click="handleViewContractDetail(latestContract)">
                    <el-icon><View /></el-icon> 查看详情
                  </el-button>
                  <el-button type="primary" size="small" @click="handleExportContractWord(latestContract)">
                    <el-icon><Download /></el-icon> 下载合同
                  </el-button>
                  <el-button type="success" size="small" @click="goToContractList(latestContract)">
                    <el-icon><Link /></el-icon> 进入合同管理
                  </el-button>
                </div>
              </div>

              <!-- 历史合同列表 -->
              <template v-if="detailData.contracts.length > 1">
                <div class="history-contracts">
                  <div class="section-title">历史合同</div>
                  <el-table :data="historyContracts" size="small" border>
                    <el-table-column prop="contract_no" label="合同编号" width="150" />
                    <el-table-column prop="contract_title" label="合同标题" min-width="150" show-overflow-tooltip />
                    <el-table-column prop="contract_amount" label="合同金额" width="110" align="right">
                      <template #default="{ row }">
                        <span class="price-actual">¥{{ formatPrice(row.contract_amount) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="90">
                      <template #default="{ row }">
                        <el-tag :type="getContractStatusType(row.status)" size="small">
                          {{ getContractStatusLabel(row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="signed_date" label="签订日期" width="100" />
                    <el-table-column label="操作" width="150" align="center">
                      <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleViewContractDetail(row)">查看</el-button>
                        <el-button link type="success" size="small" @click="handleExportContractWord(row)">下载</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </template>

            <el-empty v-else description="暂无关联合同" />
          </el-tab-pane>
        </el-tabs>
        <el-empty v-else-if="!detailLoading" description="无法加载数据" />
      </div>
    </el-drawer>

    <!-- 合同创建向导 -->
    <ContractCreateWizard
      v-model="contractWizardVisible"
      :quotation-id="selectedQuotationId"
      @success="handleContractCreated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh, Upload, View, Download, Link } from '@element-plus/icons-vue'
import { getLeadList, createLead, updateLead, addFollowUp, getLeadDetail } from '@/api/leads'
import { getUserList } from '@/api/users'
import { exportContractWord } from '@/api/contracts'
import ContractCreateWizard from '@/views/quotations/components/ContractCreateWizard.vue'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

const router = useRouter()
import dayjs from 'dayjs'
import { regionData, codeToText } from 'element-china-area-data'
import { overseasData, getContinentLabel, getCountryLabel } from '@/utils/overseas-data'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建线索')
const formRef = ref(null)
const tableData = ref([])
const userList = ref([])

// 跟踪相关
const followUpDialogVisible = ref(false)
const followUpLoading = ref(false)
const followUpFormRef = ref(null)
const uploadRef = ref(null)
const currentLeadId = ref(null)

// 获取当前用户（从localStorage）
const currentUser = computed(() => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
})

// 详情抽屉相关
const detailDrawerVisible = ref(false)
const detailLoading = ref(false)
const detailActiveTab = ref('basic')
const detailData = reactive({
  lead: null,
  followUps: [],
  quotations: [],
  contracts: [],
  timeReminders: []
})

// 合同创建向导相关
const contractWizardVisible = ref(false)
const selectedQuotationId = ref(null)

// 中国省市区数据（element-china-area-data）
const chinaRegionOptions = regionData

// 海外地区数据
const overseasOptions = overseasData

const searchForm = reactive({
  customerName: '',
  intentionLevel: '',
  warningLevel: '',  // 预警状态筛选
  demandCategory: '',
  salesOwnerId: '',
  regionCode: [],
  province: '',
  showAll: false  // 默认不显示意向为"无"的线索
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  customerName: '',
  hotelName: '',
  phone: '',
  wechat: '',
  roomCount: null,
  regionType: 'china',
  regionCode: [],
  overseasCode: [],
  province: '',
  city: '',
  district: '',
  channelSource: '',
  intentionLevel: '',
  demandCategories: [],
  salesOwnerId: null,
  requirement: ''
})

// 地区验证器
const validateRegion = (rule, value, callback) => {
  if (!form.province) {
    callback(new Error('请选择所在地区'))
  } else {
    callback()
  }
}

const formRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [
    { required: true, validator: validateRegion, trigger: 'change' }
  ],
  channelSource: [
    { required: true, message: '请选择来源渠道', trigger: 'change' }
  ],
  intentionLevel: [
    { required: true, message: '请选择意向程度', trigger: 'change' }
  ],
  demandCategories: [
    { required: true, type: 'array', min: 1, message: '请选择需求分类', trigger: 'change' }
  ]
}

// 获取三天后的日期
const getDefaultNextFollowDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 3)
  return date
}

// 禁止选择今天之前的日期
const disablePastDates = (time) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time.getTime() < today.getTime()
}

// 跟踪表单
const followUpForm = reactive({
  followTime: new Date(),
  intentionLevel: '',
  demandCategories: [],
  content: '',
  nextFollowDate: getDefaultNextFollowDate(),
  fileList: []
})

const followUpFormRules = {
  followTime: [
    { required: true, message: '请选择跟踪时间', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入跟踪备注', trigger: 'blur' }
  ]
}

// 需求分类映射
const demandCategoryMap = {
  unmanned_hotel: '无人酒店',
  self_checkin: '自助入住',
  smart_room_control: '智能客控',
  delivery_robot: '送货机器人',
  pms: '酒管系统',
  hotel_lock: '酒店门锁',
  other: '其他'
}

// 渠道来源映射
const channelSourceMap = {
  website: '官网咨询',
  wechat: '微信公众号',
  phone: '电话咨询',
  exhibition: '展会',
  referral: '客户转介绍',
  douyin: '抖音',
  other: '其他'
}

// 获取需求分类标签
const getDemandCategoryLabel = (value) => {
  return demandCategoryMap[value] || value
}

// 获取渠道来源标签
const getChannelSourceLabel = (value) => {
  return channelSourceMap[value] || value
}

// 解析需求分类
const parseDemandCategories = (categories) => {
  if (!categories) return []
  if (Array.isArray(categories)) return categories
  try {
    return JSON.parse(categories)
  } catch {
    return categories.split(',').filter(Boolean)
  }
}

// 格式化地区显示
const formatRegion = (row) => {
  if (!row) return '-'
  if (row.province === '海外' && row.city && row.district) {
    return `海外/${getContinentLabel(row.city)}/${getCountryLabel(row.city, row.district)}`
  }
  return [row.province, row.city, row.district].filter(Boolean).join('/') || '-'
}

// 地区类型变化
const handleRegionTypeChange = () => {
  form.regionCode = []
  form.overseasCode = []
  form.province = ''
  form.city = ''
  form.district = ''
}

// 中国地区选择变化
const handleChinaRegionChange = (value) => {
  if (value && value.length > 0) {
    form.province = codeToText[value[0]] || ''
    form.city = value[1] ? codeToText[value[1]] : ''
    form.district = value[2] ? codeToText[value[2]] : ''
  } else {
    form.province = ''
    form.city = ''
    form.district = ''
  }
}

// 海外地区选择变化
const handleOverseasRegionChange = (value) => {
  if (value && value.length > 0) {
    form.province = '海外'
    form.city = value[0] || '' // 大洲代码
    form.district = value[1] || '' // 国家代码
  } else {
    form.province = ''
    form.city = ''
    form.district = ''
  }
}

// 搜索地区选择变化
const handleSearchRegionChange = (value) => {
  if (value && value.length > 0) {
    searchForm.province = codeToText[value[0]] || ''
  } else {
    searchForm.province = ''
  }
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    const res = await getUserList({ pageSize: 100 })
    userList.value = res.data.list || res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.customerName || undefined,
      intentionLevel: searchForm.intentionLevel || undefined,
      warningLevel: searchForm.warningLevel !== '' ? searchForm.warningLevel : undefined,
      demandCategory: searchForm.demandCategory || undefined,
      salesOwnerId: searchForm.salesOwnerId || undefined,
      province: searchForm.province || undefined,
      excludeNone: !searchForm.showAll ? 'true' : undefined  // 默认排除意向为"无"的线索
    }
    const res = await getLeadList(params)
    let data = res.data.list || res.data.rows || []

    // 前端过滤：如果未开启"显示全部"，排除意向为"无"的线索
    if (!searchForm.showAll && !searchForm.intentionLevel) {
      data = data.filter(item => item.intentionLevel !== 'none')
    }

    tableData.value = data
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch leads:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.customerName = ''
  searchForm.intentionLevel = ''
  searchForm.warningLevel = ''
  searchForm.demandCategory = ''
  searchForm.salesOwnerId = ''
  searchForm.regionCode = []
  searchForm.province = ''
  searchForm.showAll = false
  handleSearch()
}

// 分页
const handlePageChange = (page) => {
  pagination.page = page
  fetchData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchData()
}

// 新建
const handleCreate = () => {
  dialogTitle.value = '新建线索'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑线索'
  resetForm()

  // 判断是国内还是海外
  const isOverseas = row.province === '海外'

  // 复制数据
  Object.assign(form, {
    id: row.id,
    customerName: row.customerName,
    hotelName: row.hotelName,
    phone: row.phone,
    wechat: row.wechat,
    roomCount: row.roomCount,
    regionType: isOverseas ? 'overseas' : 'china',
    regionCode: [],
    overseasCode: [],
    province: row.province,
    city: row.city,
    district: row.district,
    channelSource: row.channelSource,
    intentionLevel: row.intentionLevel,
    demandCategories: parseDemandCategories(row.demandCategories),
    salesOwnerId: row.salesOwnerId,
    requirement: row.firstDemand || row.requirement
  })

  // 初始化地区选择器
  if (isOverseas) {
    form.overseasCode = [row.city, row.district].filter(Boolean)
  } else if (row.province) {
    // 尝试将省市区名称转为code（通过遍历 codeToText 反向查找）
    try {
      const codes = []
      // 查找省份code
      for (const [code, name] of Object.entries(codeToText)) {
        if (name === row.province && code.length === 2) {
          codes.push(code)
          break
        }
      }
      // 查找城市code
      if (codes.length > 0 && row.city) {
        for (const [code, name] of Object.entries(codeToText)) {
          if (name === row.city && code.startsWith(codes[0]) && code.length === 4) {
            codes.push(code)
            break
          }
        }
      }
      // 查找区县code
      if (codes.length > 1 && row.district) {
        for (const [code, name] of Object.entries(codeToText)) {
          if (name === row.district && code.startsWith(codes[1])) {
            codes.push(code)
            break
          }
        }
      }
      form.regionCode = codes
    } catch (e) {
      console.warn('无法解析地区代码:', e)
    }
  }

  dialogVisible.value = true
}

// 从详情页编辑
const handleEditFromDetail = () => {
  if (detailData.lead) {
    detailDrawerVisible.value = false
    handleEdit(detailData.lead)
  }
}

// 查看详情
const handleView = async (row) => {
  detailDrawerVisible.value = true
  detailLoading.value = true
  detailActiveTab.value = 'basic'

  try {
    const res = await getLeadDetail(row.id)
    Object.assign(detailData, {
      lead: res.data.lead,
      followUps: res.data.followUps || [],
      quotations: res.data.quotations || [],
      contracts: res.data.contracts || [],
      timeReminders: res.data.timeReminders || []
    })
  } catch (error) {
    console.error('Failed to fetch lead detail:', error)
    ElMessage.error('获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 从详情页添加跟踪
const handleFollowUpFromDetail = () => {
  if (detailData.lead) {
    currentLeadId.value = detailData.lead.id
    resetFollowUpForm()
    followUpForm.intentionLevel = detailData.lead.intentionLevel || ''
    followUpForm.demandCategories = parseDemandCategories(detailData.lead.demandCategories)
    followUpDialogVisible.value = true
  }
}

// 从线索创建报价单
const handleCreateQuotation = () => {
  if (!detailData.lead) {
    ElMessage.warning('线索信息加载中，请稍后')
    return
  }

  // 检查是否已关联客户
  if (!detailData.lead.customerId && !detailData.lead.customer) {
    ElMessage.warning('该线索尚未转化为客户，请先转化后再创建报价单')
    return
  }

  const customerId = detailData.lead.customerId || detailData.lead.customer?.id
  const lead = detailData.lead

  // 跳转到报价单页面，带上客户和线索信息
  router.push({
    path: '/quotations',
    query: {
      action: 'create',
      customerId: customerId,
      leadId: lead.id,
      customerName: lead.customerName,
      hotelName: lead.hotelName,
      province: lead.province,
      city: lead.city,
      district: lead.district,
      roomCount: lead.roomCount
    }
  })
}

// 从列表创建报价单
const handleQuotationFromList = (row) => {
  // 检查是否已关联客户
  if (!row.customerId) {
    ElMessage.warning('该线索尚未关联客户，请先在详情中完成客户关联')
    return
  }

  router.push({
    path: '/quotations',
    query: {
      action: 'create',
      customerId: row.customerId,
      leadId: row.id,
      customerName: row.customerName,
      hotelName: row.hotelName,
      province: row.province,
      city: row.city,
      district: row.district,
      roomCount: row.roomCount
    }
  })
}

// 跟踪
const handleFollowUp = (row) => {
  currentLeadId.value = row.id
  resetFollowUpForm()
  // 初始化意向级别和需求分类为当前线索的值
  followUpForm.intentionLevel = row.intentionLevel || ''
  followUpForm.demandCategories = parseDemandCategories(row.demandCategories)
  followUpDialogVisible.value = true
}

// 重置跟踪表单
const resetFollowUpForm = () => {
  if (followUpFormRef.value) {
    followUpFormRef.value.resetFields()
  }
  followUpForm.followTime = new Date()
  followUpForm.intentionLevel = ''
  followUpForm.demandCategories = []
  followUpForm.content = ''
  followUpForm.nextFollowDate = getDefaultNextFollowDate()
  followUpForm.fileList = []
}

// 附件超出限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传5个文件')
}

// 提交跟踪记录
const handleFollowUpSubmit = async () => {
  if (!followUpFormRef.value) return

  await followUpFormRef.value.validate(async (valid) => {
    if (!valid) return

    followUpLoading.value = true
    try {
      // 准备附件信息（demo版本，只保存文件名）
      const attachments = followUpForm.fileList.map(file => ({
        name: file.name,
        size: file.size,
        type: file.raw?.type || 'unknown'
      }))

      const submitData = {
        followType: 'other',  // 默认跟踪方式
        content: followUpForm.content,
        intentionLevel: followUpForm.intentionLevel || undefined,
        nextFollowDate: followUpForm.nextFollowDate
          ? dayjs(followUpForm.nextFollowDate).format('YYYY-MM-DD')
          : undefined,
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : undefined
      }

      await addFollowUp(currentLeadId.value, submitData)

      // 如果更改了需求分类，同时更新线索的需求分类
      if (followUpForm.demandCategories.length > 0) {
        await updateLead(currentLeadId.value, {
          demandCategories: JSON.stringify(followUpForm.demandCategories),
          intentionLevel: followUpForm.intentionLevel
        })
      }

      ElMessage.success('跟踪记录添加成功')
      followUpDialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('Failed to add follow up:', error)
      ElMessage.error('添加失败')
    } finally {
      followUpLoading.value = false
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      // 准备提交数据
      const submitData = {
        customerName: form.customerName,
        hotelName: form.hotelName,
        phone: form.phone,
        wechat: form.wechat,
        roomCount: form.roomCount,
        province: form.province,
        city: form.city,
        district: form.district,
        channelSource: form.channelSource,
        intentionLevel: form.intentionLevel,
        demandCategories: form.demandCategories.length > 0 ? JSON.stringify(form.demandCategories) : null,
        salesOwnerId: form.salesOwnerId,
        firstDemand: form.requirement
      }

      if (form.id) {
        await updateLead(form.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createLead(submitData)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('Submit failed:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.id = null
  form.customerName = ''
  form.hotelName = ''
  form.phone = ''
  form.wechat = ''
  form.roomCount = null
  form.regionType = 'china'
  form.regionCode = []
  form.overseasCode = []
  form.province = ''
  form.city = ''
  form.district = ''
  form.channelSource = ''
  form.intentionLevel = ''
  form.demandCategories = []
  form.salesOwnerId = null
  form.requirement = ''
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

// 格式化日期时间
const formatDateTime = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 判断是否已过期
const isOverdue = (date) => {
  if (!date) return false
  return dayjs(date).isBefore(dayjs(), 'day')
}

// 获取行样式类名（根据预警级别）
const getRowClassName = ({ row }) => {
  if (row.warningLevel === 2) {
    return 'warning-row-red'
  } else if (row.warningLevel === 1) {
    return 'warning-row-orange'
  }
  return ''
}

// 状态映射
const getStatusLabel = (status) => {
  const map = { 1: '新建', 2: '跟进中', 3: '已转化', 4: '已放弃' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'primary', 3: 'success', 4: 'danger' }
  return map[status] || 'info'
}

// 意向程度映射
const getIntentionLabel = (level) => {
  const map = { high: '高', medium: '中', low: '低', none: '无' }
  return map[level] || '-'
}

const getIntentionType = (level) => {
  const map = { high: 'danger', medium: 'warning', low: 'info', none: '' }
  return map[level] || 'info'
}

// 合同状态映射
const getContractStatusLabel = (status) => {
  const map = { 1: '草稿', 2: '待审批', 3: '已签约', 4: '执行中', 5: '已完成', 6: '已终止' }
  return map[status] || '未知'
}

const getContractStatusType = (status) => {
  const map = { 1: 'info', 2: 'warning', 3: 'primary', 4: 'success', 5: 'success', 6: 'danger' }
  return map[status] || 'info'
}

// 报价单状态映射
const getQuotationStatusLabel = (status) => {
  const map = {
    draft: '草稿',
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    sent: '已发送',
    accepted: '已接受',
    voided: '已作废'
  }
  return map[status] || status || '未知'
}

const getQuotationStatusType = (status) => {
  const map = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    sent: 'primary',
    accepted: 'success',
    voided: 'danger'
  }
  return map[status] || 'info'
}

// 格式化价格
const formatPrice = (price) => {
  const num = parseFloat(price) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 最新报价单（非作废状态的第一条）
const latestQuotation = computed(() => {
  if (!detailData.quotations || detailData.quotations.length === 0) return null
  return detailData.quotations.find(q => q.status !== 'voided') || detailData.quotations[0]
})

// 历史报价单（除最新外）
const historyQuotations = computed(() => {
  if (!detailData.quotations || detailData.quotations.length <= 1) return []
  const latest = latestQuotation.value
  return detailData.quotations.filter(q => q.quotation_id !== latest?.quotation_id)
})

// 最新合同
const latestContract = computed(() => {
  if (!detailData.contracts || detailData.contracts.length === 0) return null
  return detailData.contracts[0]
})

// 历史合同（除最新外）
const historyContracts = computed(() => {
  if (!detailData.contracts || detailData.contracts.length <= 1) return []
  return detailData.contracts.slice(1)
})

// 查看合同详情（跳转到合同页面并打开详情弹窗）
const handleViewContractDetail = (contract) => {
  router.push({
    path: '/contracts',
    query: { viewId: contract.contract_id }
  })
}

// 进入合同列表
const goToContractList = (contract) => {
  router.push({
    path: '/contracts',
    query: { contractId: contract.contract_id }
  })
}

// 导出合同Word - 按照标准合同模板生成
const handleExportContractWord = async (contract) => {
  try {
    ElMessage.info('正在生成合同文档...')
    const res = await exportContractWord(contract.contract_id)
    const data = res.data

    // 计算付款阶段金额
    const paymentStages = data.payment_terms?.stages || [
      { stage: 1, name: '预付款', percentage: 30 },
      { stage: 2, name: '发货款', percentage: 70 }
    ]
    const stageAmounts = paymentStages.map(s => ({
      ...s,
      amount: Math.round(data.contract_amount * s.percentage / 100 * 100) / 100
    }))

    // 生成付款条款段落
    const paymentParagraphs = stageAmounts.map((stage, index) =>
      new Paragraph({
        children: [
          new TextRun({ text: `（${index + 1}）${stage.name}：甲方向乙方支付合同总金额的${stage.percentage}%（${stage.amount.toFixed(2)}元）。`, size: 24 })
        ],
        spacing: { after: 50 }
      })
    )

    // 创建Word文档 - 按照标准合同模板
    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        children: [
          // 合同头部信息
          new Paragraph({
            children: [
              new TextRun({ text: `合同编号：${data.contract_no}`, size: 20 }),
              new TextRun({ text: '                    ', size: 20 }),
              new TextRun({ text: `签订日期：${data.signed_date || '________'}`, size: 20 })
            ],
            spacing: { after: 50 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `签署地点：${data.signing_location || '温州'}`, size: 20 }),
              new TextRun({ text: '                    ', size: 20 }),
              new TextRun({ text: `酒店名称：${data.hotel_name || '________'}`, size: 20 })
            ],
            spacing: { after: 300 }
          }),

          // 合同标题
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '客房智能化系统购销合同', bold: true, size: 36 })],
            spacing: { before: 100, after: 300 }
          }),

          // 甲乙双方
          new Paragraph({
            children: [
              new TextRun({ text: '甲方：', bold: true, size: 24 }),
              new TextRun({ text: data.party_a_name || '________________', size: 24 })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '乙方：', bold: true, size: 24 }),
              new TextRun({ text: '温州艾居来智能科技有限公司', size: 24 })
            ],
            spacing: { after: 200 }
          }),

          // 合同前言
          new Paragraph({
            children: [new TextRun({ text: '根据《中华人民共和国合同法》及其他有关法律、法规的规定，甲乙双方经过友好协商，就乙方向甲方供客房智能控制系统事宜达成一致，特签订本合同，以资共同遵守。', size: 24 })],
            spacing: { after: 300 }
          }),

          // 第一条
          new Paragraph({ children: [new TextRun({ text: '第一条　产品名称、数量、价格：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: '详见合同附件一', size: 24 })], spacing: { after: 200 } }),

          // 第二条
          new Paragraph({ children: [new TextRun({ text: '第二条 产品的包装标准：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: '1．产品必须由乙方妥善包装，适合运输、防潮、防湿、防锈，任何由于乙方包装不善而造成的损失由乙方负责。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '2．运输包装上的标记由乙方印刷。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '3．产品所需包装物以及所产生的包装费由乙方供应及承担。', size: 24 })], spacing: { after: 200 } }),

          // 第三条
          new Paragraph({ children: [new TextRun({ text: '第三条　产品的技术标准和质量要求：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: '1．乙方保证所提供的产品均是全新的、未用过的，并符合国际行业对于该类产品的质量标准（CE、FCC及RoHS）和本合同规定的型号、数量及样品的技术质量标准。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '2．乙方所提供产品应和装箱清单一致。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '3．乙方在接到甲方书面通知后安排发货，并对现场施工进行技术指导，确保施工质量及进度。', size: 24 })], spacing: { after: 200 } }),

          // 第四条
          new Paragraph({ children: [new TextRun({ text: '第四条　产品的交货方法、到货地点：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `1．交货方法：${data.delivery_method || '按乙方安排的物流公司交付'}。`, size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: `2．交货地点：${data.delivery_address || data.project_address || '________________'}`, size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: `3．产品运输费用由${data.freight_bearer || '甲方'}承担，合同款是产品交付甲方的落地价。`, size: 24 })], spacing: { after: 200 } }),

          // 第五条
          new Paragraph({ children: [new TextRun({ text: '第五条　产品的价格及支付方式：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `1．本合同产品按照 ${data.room_count || '____'} 套计算，详见附件，总价金额（小写）：${data.contract_amount.toFixed(2)}元（人民币），（大写）：${data.amount_in_words}元整(人民币)。`, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: '2．甲方应按如下方式向乙方支付货款：', size: 24 })], spacing: { after: 50 } }),
          ...paymentParagraphs,
          new Paragraph({ children: [new TextRun({ text: `3．付款方式：${data.payment_terms?.payment_method || '银行电汇'}`, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `乙方户名：${data.bank_info?.name || '温州艾居来智能科技有限公司'}`, size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: `开 户 行：${data.bank_info?.bank || '宁波银行股份有限公司温州经济技术开发区支行'}`, size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: `帐　　号：${data.bank_info?.account || '86041110000759370'}`, size: 24 })], spacing: { after: 200 } }),

          // 第六条
          new Paragraph({ children: [new TextRun({ text: '第六条　产品的验收方法：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: '1．产品由甲方验收。乙方应在产品到达交货地点前通知甲方做好验收准备。本合同所附的产品清单以及乙方随货提供的产品质量合格证明等资料作为验收产品的依据。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '2．甲方在验收中发现产品的型号、数量、质量等与合同约定不符，有权拒收该部分货物，乙方应及时调换合格产品给甲方，保证施工进度。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '3．在抽样验收时甲方应提供临时连接设备对产品进行连接试验。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '4．验收后，在施工安装过程中若监理、甲方发现产品存有质量问题，应向乙方提出书面异议。乙方在接到甲方书面异议后，应在7个工作日内负责调换处理。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '5．工程竣工验收时，乙方有权参与该项目的测试验收工作。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '6．产品测试验收有问题，甲方应及时书面说明情况，若酒店开业甲方对产品无异议，视为产品全部测试合格。', size: 24 })], spacing: { after: 200 } }),

          // 第七条
          new Paragraph({ children: [new TextRun({ text: '第七条　产品的保修：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `1．乙方对产品的质保期为${data.warranty_period || 5}年，自产品安装验收合格之日起算，质保期内乙方在收到甲方书面通知后对其产品进行免费维修或产品免费更换。`, size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '2．乙方对产品实行终身保修，在保修期内维修只收取成本费。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '3．质保期内，甲方采用不当的运输造成的损失，雷击、进水、非正常的电压和不当的使用造成的损坏，人为或自然灾害所造成的故障或损坏，私自维修而产生的损坏，使用非正规的劣质通信线缆造成的损失，乙方不承担保修责任。', size: 24 })], spacing: { after: 200 } }),

          // 第八条
          new Paragraph({ children: [new TextRun({ text: '第八条　违约责任：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: '1．本合同生效后，甲方逾期付款的或乙方逾期供货的，应按逾期付款或供货金额的日千分之一向对方支付违约金。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '2．乙方提供的产品的型号、规格、数量、质量不符合同约定的，乙方应负责调换，并承担因调换运输产生的费用，因此给甲方造成损失的还须承担赔偿责任。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '3．乙方所供产品无法正常拆装、维修而损坏，乙方负责免费维修及更换，并且承担由此给甲方造成的直接经济损失。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '4．未经另一方同意，甲乙双方不得将合同金额及报价泄露给第三方，如有违约，违约方应向另一方支付此合同总金额的百分之五的违约金。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '5．由于一方原因无法履行合同，违约方应向守约方偿付此合同标的金额的百分之五的违约金。该违约金支付后，本合同即告解除。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '6．甲乙双方的任何一方由于不可抗力的原因不能履行合同时，应及时向对方通报不能履行或不能完全履行的理由，在取得有关机构证明后，允许延期履行、部分履行或不履行合同，双方对此互不提出赔偿责任。', size: 24 })], spacing: { after: 200 } }),

          // 第九条
          new Paragraph({ children: [new TextRun({ text: '第九条　其它：', bold: true, size: 24 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: '1．按合同规定应该偿付的违约金、赔偿金和各种经济损失，应当在明确责任后十天内，按银行规定的结算办法付清，否则，按逾期付款处理。但任何一方不得自行扣发货物或扣付货款来充抵。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '2．除本合同另有规定外，任何一方支付违约金、赔偿金和其他经济损失，不影响违约方应当继续履行合同项下的义务。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '3．甲乙双方约定书面通知形式为传真或邮件，在执行本合同过程中发生任何纠纷，应友好协商解决，协商不成的，可向法院提请诉讼。', size: 24 })], spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: '4．本合同如有未尽事宜或履行过程中出现新情况，双方可以签订补充协议或备忘录予以明确，补充协议或备忘录与本合同具有同等效力。', size: 24 })], spacing: { after: 200 } }),

          // 第十条
          new Paragraph({ children: [new TextRun({ text: '第十条　本合同一式肆份，甲乙双方各执贰份。附件为主合同一部分，具有同等法律效力。本合同自甲乙双方签字或盖章之日起生效。', bold: true, size: 24 })], spacing: { after: 200 } }),

          // 以下合同无正文
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '（以下合同无正文）', size: 24 })], spacing: { before: 200, after: 400 } }),

          // 签署区域
          createSignatureTable(data),

          // 附件一：产品明细（新页）
          new Paragraph({ children: [new TextRun({ text: '', size: 24 })], pageBreakBefore: true }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '附件一：产品明细', bold: true, size: 28 })], spacing: { after: 300 } }),
          createProductTable(data.items, data.contract_amount)
        ]
      }]
    })

    // 生成并下载
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${data.contract_no}_${data.hotel_name || '合同'}.docx`)
    ElMessage.success('合同文档下载成功')

  } catch (err) {
    console.error('导出合同失败:', err)
    ElMessage.error('导出合同失败: ' + (err.message || '未知错误'))
  }
}

// 创建签署表格
const createSignatureTable = (data) => {
  const noBorder = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '甲方（盖章）：', bold: true, size: 22 })] })], width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '乙方（盖章）：温州艾居来智能科技有限公司', bold: true, size: 22 })] })], borders: noBorder })
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `地址：${data.party_a_address || '________________'}`, size: 22 })] })], borders: noBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '地址：浙江温州龙湾区滨海五道696号万洋众创城19栋', size: 22 })] })], borders: noBorder })
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `甲方代表（签字）：${data.party_a_representative || '________________'}`, size: 22 })] })], borders: noBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `乙方代表（签字）：${data.party_b_representative || '________________'}`, size: 22 })] })], borders: noBorder })
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `电话：${data.party_a_phone || '________________'}`, size: 22 })] })], borders: noBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `电话：${data.party_b_phone || '13052060689'}`, size: 22 })] })], borders: noBorder })
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `传真：${data.party_a_fax || '________________'}`, size: 22 })] })], borders: noBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '传真：________________', size: 22 })] })], borders: noBorder })
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `日期：${data.signed_date || '____年____月____日'}`, size: 22 })] })], borders: noBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `日期：${data.signed_date || '____年____月____日'}`, size: 22 })] })], borders: noBorder })
      ]})
    ]
  })
}

// 创建产品表格（附件一）
const createProductTable = (items, totalAmount) => {
  const rows = [
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '序号', bold: true, size: 22 })] })], width: { size: 8, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '产品编码', bold: true, size: 22 })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '产品名称', bold: true, size: 22 })] })], width: { size: 27, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '规格型号', bold: true, size: 22 })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '数量', bold: true, size: 22 })] })], width: { size: 10, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '单价(元)', bold: true, size: 22 })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '金额(元)', bold: true, size: 22 })] })], width: { size: 13, type: WidthType.PERCENTAGE } })
    ]})
  ]

  items.forEach((item, index) => {
    rows.push(new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(index + 1), size: 22 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.product_code || '', size: 22 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.product_name || '', size: 22 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.specification || '', size: 22 })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(item.quantity), size: 22 })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: item.unit_price.toFixed(2), size: 22 })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: item.subtotal.toFixed(2), size: 22 })] })] })
    ]}))
  })

  rows.push(new TableRow({ children: [
    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '合计', bold: true, size: 22 })] })], columnSpan: 6 }),
    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: totalAmount.toFixed(2), bold: true, size: 22 })] })] })
  ]}))

  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })
}

// 查看报价单详情
const handleViewQuotation = (quotation) => {
  router.push({
    path: '/quotations',
    query: { view: quotation.quotation_id }
  })
}

// 导出报价单PDF
const handleExportQuotationPDF = (quotation) => {
  router.push({
    path: '/quotations',
    query: { exportPdf: quotation.quotation_id }
  })
}

// 导出报价单Excel
const handleExportQuotationExcel = async (quotation) => {
  try {
    const { exportQuotationExcel } = await import('@/api/quotations')
    const response = await exportQuotationExcel(quotation.quotation_id)

    // 创建下载链接
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `报价单_${quotation.quotation_no || quotation.quotation_id}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (err) {
    console.error('导出Excel失败:', err)
    ElMessage.error('导出Excel失败')
  }
}

// 修改报价单
const handleReviseQuotation = (quotation) => {
  router.push({
    path: '/quotations',
    query: { revise: quotation.quotation_id }
  })
}

// 从报价单创建合同
const handleCreateContract = (quotation) => {
  selectedQuotationId.value = quotation.quotation_id
  contractWizardVisible.value = true
}

// 合同创建成功
const handleContractCreated = (contract) => {
  ElMessage.success(`合同 ${contract.contract_no} 创建成功`)
  // 刷新详情数据
  if (detailData.lead) {
    handleView(detailData.lead)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
  fetchUserList()
})
</script>

<style scoped>
.leads-page {
  padding: 0;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
}

/* 详情抽屉样式 */
.detail-drawer {
  padding: 0 10px;
}

.time-reminders {
  margin-bottom: 16px;
}

.detail-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}

/* 跟踪记录样式 */
.followup-header {
  margin-bottom: 16px;
}

.quotation-header {
  margin-bottom: 16px;
}

.followup-card {
  padding: 12px;
}

.followup-card :deep(.el-card__body) {
  padding: 12px;
}

.followup-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.followup-header-info .operator {
  font-weight: 500;
  color: #303133;
}

.followup-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.followup-next {
  font-size: 12px;
  color: #909399;
}

.followup-attachments {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 预警状态指示器 */
.lead-no-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.warning-green {
  background-color: #67c23a;
}

.warning-orange {
  background-color: #e6a23c;
  animation: pulse-orange 1.5s infinite;
}

.warning-red {
  background-color: #f56c6c;
  animation: pulse-red 1s infinite;
}

@keyframes pulse-orange {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* 预警行背景色 */
:deep(.warning-row-orange) {
  background-color: #fdf6ec !important;
}

:deep(.warning-row-orange:hover > td) {
  background-color: #fcf0db !important;
}

:deep(.warning-row-red) {
  background-color: #fef0f0 !important;
}

:deep(.warning-row-red:hover > td) {
  background-color: #fde2e2 !important;
}

/* 报价单相关样式 */
.latest-quotation-section {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title-row .section-title {
  margin-bottom: 0;
}

.quotation-items {
  margin-top: 16px;
}

.items-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.quotation-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.history-quotations {
  margin-top: 20px;
}

/* 合同相关样式 */
.latest-contract-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.contract-items {
  margin-top: 16px;
}

.contract-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.history-contracts {
  margin-top: 20px;
}

.price-actual {
  color: #e74c3c;
  font-weight: 500;
}

/* 预警状态筛选下拉框样式 */
.warning-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 最新跟踪记录列样式 */
.latest-followup-cell {
  line-height: 1.4;
}

.followup-content-preview {
  color: #303133;
  font-size: 13px;
  margin-bottom: 4px;
  word-break: break-all;
}

.followup-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.followup-operator {
  color: #409eff;
}

.followup-time {
  color: #909399;
}

.no-followup {
  color: #c0c4cc;
  font-size: 13px;
}
</style>
