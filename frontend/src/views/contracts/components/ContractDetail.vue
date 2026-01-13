<template>
  <el-drawer
    v-model="visible"
    title="合同详情"
    direction="rtl"
    size="75%"
    :destroy-on-close="true"
  >
    <div v-loading="loading" class="contract-detail">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 基础信息 Tab -->
        <el-tab-pane label="基础信息" name="basic">
          <!-- 操作按钮区域 -->
          <div class="action-bar">
            <el-button
              v-if="contract.status === 'draft'"
              type="primary"
              @click="handleEdit"
            >
              编辑
            </el-button>
            <el-button
              v-if="contract.status === 'draft'"
              type="success"
              @click="handleConfirm"
            >
              确认合同
            </el-button>
            <el-button
              v-if="contract.status === 'pending'"
              type="primary"
              @click="handleSendOut"
            >
              寄出合同
            </el-button>
            <el-button
              v-if="contract.status === 'sent'"
              type="success"
              @click="handleReceiveBack"
            >
              收回合同
            </el-button>
            <el-button
              v-if="contract.status !== 'voided' && contract.status !== 'completed'"
              type="danger"
              @click="handleVoid"
            >
              作废
            </el-button>
            <el-button
              v-if="contract.status === 'voided'"
              type="warning"
              @click="handleRestore"
            >
              恢复合同
            </el-button>
            <el-button
              v-if="canInitiateServiceTicket"
              type="primary"
              @click="handleInitiateServiceTicket"
            >
              发起售后
            </el-button>
          </div>

          <div class="info-section">
            <div class="section-title">合同信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="合同编号">{{ contract.contract_no }}</el-descriptions-item>
              <el-descriptions-item label="合同状态">
                <el-tag :type="getStatusType(contract.status)">{{ getStatusLabel(contract.status) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="合同标题" :span="2">{{ contract.contract_title }}</el-descriptions-item>
              <el-descriptions-item label="合同金额">
                <span class="amount-highlight">¥{{ formatMoney(contract.contract_amount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="金额大写">{{ contract.amount_in_words || '-' }}</el-descriptions-item>
              <el-descriptions-item label="签订日期">{{ contract.signed_date || '-' }}</el-descriptions-item>
              <el-descriptions-item label="签订地点">{{ contract.signing_location || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <div class="section-title">甲方信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="甲方名称">{{ contract.party_a_name || contract.customer?.customerName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="甲方代表">{{ contract.party_a_representative || '-' }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ contract.party_a_phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="传真">{{ contract.party_a_fax || '-' }}</el-descriptions-item>
              <el-descriptions-item label="地址" :span="2">{{ contract.party_a_address || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <div class="section-title">项目信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="酒店名称">{{ contract.hotel_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="房间数量">{{ contract.room_count || '-' }}</el-descriptions-item>
              <el-descriptions-item label="项目地址" :span="2">{{ contract.project_address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="交货方式">{{ contract.delivery_method || '-' }}</el-descriptions-item>
              <el-descriptions-item label="运费承担">{{ contract.freight_bearer === 'party_a' ? '甲方' : '乙方' }}</el-descriptions-item>
              <el-descriptions-item label="交货地点" :span="2">{{ contract.delivery_address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="质保期限">{{ contract.warranty_period || 5 }}年</el-descriptions-item>
              <el-descriptions-item label="终身保修">{{ contract.lifetime_maintenance ? '是' : '否' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <div class="section-title">关联信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="客户经理">{{ contract.owner?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="来源报价单">{{ contract.sourceQuotation?.quotation_no || '-' }}</el-descriptions-item>
              <el-descriptions-item label="关联线索">{{ contract.lead?.leadNo || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ contract.customer?.customerName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="线索渠道">{{ getChannelLabel(contract.lead?.channelSource) }}</el-descriptions-item>
              <el-descriptions-item label="线索创建人">{{ contract.lead?.createdByUser?.name || contract.lead?.createdByUser?.username || '-' }}</el-descriptions-item>
              <el-descriptions-item label="线索创建时间" :span="2">{{ formatDateTime(contract.lead?.created_at) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-if="contract.items && contract.items.length > 0" class="info-section">
            <div class="section-title">产品明细</div>
            <el-table :data="contract.items" size="small" border max-height="300">
              <el-table-column prop="product_name" label="产品名称" min-width="150" show-overflow-tooltip />
              <el-table-column prop="product_code" label="产品编码" width="140" />
              <el-table-column prop="quantity" label="数量" width="80" align="center" />
              <el-table-column prop="product_unit" label="单位" width="60" align="center" />
              <el-table-column prop="unit_price" label="单价" width="100" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.unit_price) }}</template>
              </el-table-column>
              <el-table-column prop="subtotal" label="小计" width="120" align="right">
                <template #default="{ row }">
                  <span class="amount-highlight">¥{{ formatMoney(row.subtotal) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 收款 Tab -->
        <el-tab-pane label="收款" name="payments">
          <!-- 付款阶段进度 -->
          <div v-if="paymentStagesStatus && paymentStagesStatus.length > 0" class="payment-stages">
            <div class="section-title">付款阶段</div>
            <el-table :data="paymentStagesStatus" size="small" border>
              <el-table-column prop="name" label="阶段" width="100" />
              <el-table-column label="应付金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column label="已付金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.paid_amount) }}</template>
              </el-table-column>
              <el-table-column label="未付金额" width="120" align="right">
                <template #default="{ row }">
                  <span :class="{ 'amount-highlight': (row.amount - (row.paid_amount || 0)) > 0 }">
                    ¥{{ formatMoney(row.amount - (row.paid_amount || 0)) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="percentage" label="比例" width="70" align="center">
                <template #default="{ row }">{{ row.percentage }}%</template>
              </el-table-column>
              <el-table-column prop="condition" label="付款条件" min-width="150" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'completed'" type="success" size="small">已完成</el-tag>
                  <el-tag v-else-if="row.status === 'partial'" type="warning" size="small">部分</el-tag>
                  <el-tag v-else type="info" size="small">待付</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ row, $index }">
                  <el-button
                    v-if="row.status !== 'completed'"
                    link
                    type="primary"
                    size="small"
                    @click="handleStagePayment(row, $index)"
                  >
                    收款
                  </el-button>
                  <span v-else class="text-success">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 收款记录列表 -->
          <div class="payment-records">
            <div class="section-title">收款记录</div>
            <el-table v-if="payments && payments.length > 0" :data="payments" size="small" border>
              <el-table-column prop="payment_no" label="收款编号" width="150" />
              <el-table-column prop="payment_stage" label="收款阶段" width="100" />
              <el-table-column prop="payment_amount" label="金额" width="110" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.payment_amount) }}</template>
              </el-table-column>
              <el-table-column prop="payment_date" label="收款日期" width="100" />
              <el-table-column prop="payment_method" label="方式" width="80" />
              <el-table-column prop="bank_account" label="收款账户" min-width="150" show-overflow-tooltip />
              <el-table-column prop="payment_note" label="备注" min-width="120" show-overflow-tooltip />
            </el-table>
            <el-empty v-else description="暂无收款记录" />
          </div>
        </el-tab-pane>

        <!-- 发货 Tab -->
        <el-tab-pane label="发货" name="shipments">
          <!-- 发货明细 -->
          <div class="shipment-items-section">
            <div class="section-title">
              发货明细
              <el-button type="primary" size="small" style="margin-left: 15px" @click="handleAddShipment" :disabled="!hasUnshippedItems">
                添加发货
              </el-button>
            </div>
            <el-table v-if="contract.items && contract.items.length > 0" :data="contract.items" size="small" border>
              <el-table-column prop="product_name" label="产品名称" min-width="150" show-overflow-tooltip />
              <el-table-column prop="product_code" label="产品编码" width="120" />
              <el-table-column prop="quantity" label="合同数量" width="90" align="center" />
              <el-table-column prop="product_unit" label="单位" width="60" align="center" />
              <el-table-column label="已发货" width="90" align="center">
                <template #default="{ row }">
                  <span :class="{ 'text-success': row.shipped_quantity >= row.quantity }">
                    {{ row.shipped_quantity || 0 }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="未发货" width="90" align="center">
                <template #default="{ row }">
                  <span :class="{ 'amount-highlight': (row.quantity - (row.shipped_quantity || 0)) > 0 }">
                    {{ row.quantity - (row.shipped_quantity || 0) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="发货状态" width="90" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.shipped_quantity >= row.quantity" type="success" size="small">已完成</el-tag>
                  <el-tag v-else-if="row.shipped_quantity > 0" type="warning" size="small">部分</el-tag>
                  <el-tag v-else type="info" size="small">待发货</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无产品明细" />
          </div>

          <!-- 发货记录 -->
          <div class="shipment-records-section">
            <div class="section-title">发货记录</div>
            <el-table v-if="shipments && shipments.length > 0" :data="shipments" size="small" border>
              <el-table-column prop="shipment_no" label="发货编号" width="160" />
              <el-table-column prop="shipment_amount" label="发货金额" width="110" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.shipment_amount) }}</template>
              </el-table-column>
              <el-table-column prop="actual_ship_date" label="发货日期" width="100">
                <template #default="{ row }">{{ formatDate(row.actual_ship_date) }}</template>
              </el-table-column>
              <el-table-column prop="logistics_company" label="物流公司" width="100" />
              <el-table-column prop="tracking_no" label="快递单号" width="140" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'delivered'" type="success" size="small">已送达</el-tag>
                  <el-tag v-else-if="row.status === 'shipped'" type="primary" size="small">已发货</el-tag>
                  <el-tag v-else-if="row.status === 'cancelled'" type="danger" size="small">已取消</el-tag>
                  <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="notes" label="备注" min-width="120" show-overflow-tooltip />
            </el-table>
            <el-empty v-else description="暂无发货记录" />
          </div>
        </el-tab-pane>

        <!-- 发票 Tab -->
        <el-tab-pane label="发票" name="invoices">
          <!-- 发票要求信息 -->
          <div class="invoice-requirements">
            <div class="section-title">
              发票要求
              <el-button
                v-if="contract.invoice_type !== 'none'"
                type="primary"
                size="small"
                style="margin-left: 15px"
                @click="handleAddInvoice"
                :disabled="!hasUninvoicedAmount"
              >
                开票
              </el-button>
            </div>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="发票类型">
                <el-tag v-if="contract.invoice_type === 'special'" type="danger" size="small">增值税专票</el-tag>
                <el-tag v-else-if="contract.invoice_type === 'normal'" type="primary" size="small">增值税普票</el-tag>
                <el-tag v-else type="info" size="small">无需开票</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开票公司">{{ contract.invoice_company || contract.party_a_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="税号">{{ contract.invoice_tax_id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="合同金额">
                <span class="amount-highlight">¥{{ formatMoney(contract.contract_amount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="已开票金额">
                <span :class="{ 'text-success': (contract.invoiced_amount || 0) >= (contract.contract_amount || 0) }">
                  ¥{{ formatMoney(contract.invoiced_amount || 0) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="待开票金额">
                <span :class="{ 'amount-highlight': uninvoicedAmount > 0 }">
                  ¥{{ formatMoney(uninvoicedAmount) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item v-if="contract.invoice_remark" label="开票备注" :span="3">
                {{ contract.invoice_remark }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 开票记录 -->
          <div class="invoice-records">
            <div class="section-title">开票记录</div>
            <el-table v-if="invoices && invoices.length > 0" :data="invoices" size="small" border>
              <el-table-column prop="invoice_no" label="发票号码" width="160" />
              <el-table-column prop="invoice_amount" label="开票金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.invoice_amount) }}</template>
              </el-table-column>
              <el-table-column prop="invoice_type" label="发票类型" width="100">
                <template #default="{ row }">
                  {{ row.invoice_type === 'special' ? '专票' : '普票' }}
                </template>
              </el-table-column>
              <el-table-column prop="invoice_date" label="开票日期" width="100" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'confirmed'" type="success" size="small">已开</el-tag>
                  <el-tag v-else-if="row.status === 'draft'" type="warning" size="small">待开</el-tag>
                  <el-tag v-else-if="row.status === 'voided'" type="danger" size="small">作废</el-tag>
                  <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="invoice_title" label="发票抬头" min-width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'draft'"
                    link
                    type="primary"
                    size="small"
                    @click="handleConfirmInvoice(row)"
                  >
                    确认开票
                  </el-button>
                  <el-button
                    v-if="row.status === 'confirmed'"
                    link
                    type="danger"
                    size="small"
                    @click="handleVoidInvoice(row)"
                  >
                    作废
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无开票记录" />
          </div>
        </el-tab-pane>

        <!-- 跟踪记录 Tab -->
        <el-tab-pane label="跟踪记录" name="tracking">
          <div class="tab-header">
            <span class="tab-title">合同跟踪记录</span>
            <el-button type="primary" size="small" @click="handleAddTrackRecord">添加记录</el-button>
          </div>

          <el-timeline v-if="trackRecords && trackRecords.length > 0">
            <el-timeline-item
              v-for="record in trackRecords"
              :key="record.id"
              :timestamp="formatDateTime(record.created_at)"
              placement="top"
              :type="getTrackTypeColor(record.followType)"
            >
              <div class="track-record-item">
                <div class="record-header">
                  <el-tag size="small" :type="getTrackTypeColor(record.followType)">
                    {{ getTrackTypeLabel(record.followType) }}
                  </el-tag>
                  <span class="record-operator">{{ record.operator?.name || record.operator?.username || '-' }}</span>
                </div>
                <div class="record-content">{{ record.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无跟踪记录" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 添加跟踪记录对话框 -->
    <el-dialog
      v-model="trackDialogVisible"
      title="添加跟踪记录"
      width="500px"
      append-to-body
    >
      <el-form :model="trackForm" :rules="trackFormRules" ref="trackFormRef" label-width="80px">
        <el-form-item label="操作类型" prop="followType">
          <el-select v-model="trackForm.followType" placeholder="请选择操作类型" style="width: 100%">
            <el-option label="合同创建" value="created" />
            <el-option label="合同寄出" value="sent_out" />
            <el-option label="合同收回" value="received_back" />
            <el-option label="付款记录" value="payment" />
            <el-option label="发票记录" value="invoice" />
            <el-option label="发货记录" value="shipment" />
            <el-option label="状态变更" value="status_change" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录内容" prop="content">
          <el-input
            v-model="trackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟踪记录内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTrackRecord" :loading="trackSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 确认/收回/作废对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      :title="statusDialogTitle"
      width="450px"
      append-to-body
    >
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="备注">
          <el-input
            v-model="statusForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatusChange" :loading="statusSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 寄出对话框 -->
    <el-dialog
      v-model="sendOutDialogVisible"
      title="寄出合同"
      width="450px"
      append-to-body
    >
      <el-form :model="sendOutForm" label-width="80px">
        <el-form-item label="快递单号">
          <el-input v-model="sendOutForm.trackingNo" placeholder="请输入快递单号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="sendOutForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendOutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSendOut" :loading="statusSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 阶段付款对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      :title="paymentDialogTitle"
      width="550px"
      append-to-body
    >
      <el-form :model="paymentForm" :rules="paymentFormRules" ref="paymentFormRef" label-width="100px">
        <el-form-item label="付款阶段">
          <el-input :value="paymentForm.stageName" disabled style="width: 150px" />
          <span class="form-info">应付: ¥{{ formatMoney(paymentForm.stageAmount) }} | 已付: ¥{{ formatMoney(paymentForm.paidAmount) }}</span>
        </el-form-item>
        <el-form-item label="本次付款" prop="paymentAmount">
          <el-input-number
            v-model="paymentForm.paymentAmount"
            :min="0.01"
            :max="paymentForm.remainingAmount"
            :precision="2"
            :step="100"
            style="width: 200px"
          />
          <span class="form-tip">（未付: ¥{{ formatMoney(paymentForm.remainingAmount) }}）</span>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="paymentForm.paymentMethod" placeholder="请选择支付方式" style="width: 200px">
            <el-option label="银行电汇" value="银行电汇" />
            <el-option label="银行转账" value="银行转账" />
            <el-option label="支票" value="支票" />
            <el-option label="现金" value="现金" />
            <el-option label="微信" value="微信" />
            <el-option label="支付宝" value="支付宝" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款账户" prop="bankAccount">
          <el-input v-model="paymentForm.bankAccount" placeholder="请输入收款银行账户" />
        </el-form-item>
        <el-form-item label="流水号">
          <el-input v-model="paymentForm.transactionNo" placeholder="请输入银行流水号/交易单号" />
        </el-form-item>
        <el-form-item label="收款日期" prop="paymentDate">
          <el-date-picker
            v-model="paymentForm.paymentDate"
            type="date"
            placeholder="选择收款日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="paymentForm.notes"
            type="textarea"
            :rows="2"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
        <el-form-item label="付款凭证">
          <el-upload
            v-model:file-list="paymentForm.attachments"
            action="#"
            :auto-upload="false"
            :limit="5"
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持jpg/png/pdf格式，最多5个文件</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paymentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStagePayment" :loading="paymentSubmitting">确认收款</el-button>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipmentDialogVisible"
      title="添加发货"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="shipmentForm" :rules="shipmentFormRules" ref="shipmentFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物流公司">
              <el-input v-model="shipmentForm.logisticsCompany" placeholder="请输入物流公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="快递单号">
              <el-input v-model="shipmentForm.trackingNo" placeholder="请输入快递单号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收货人">
              <el-input v-model="shipmentForm.contactPerson" placeholder="请输入收货人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="shipmentForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="收货地址">
          <el-input v-model="shipmentForm.shippingAddress" placeholder="请输入收货地址" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="shipmentForm.notes" type="textarea" :rows="2" placeholder="请输入备注（可选）" />
        </el-form-item>
        <el-form-item label="发货明细" required>
          <el-table :data="shipmentForm.items" size="small" border max-height="300">
            <el-table-column prop="product_name" label="产品名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="product_code" label="产品编码" width="110" />
            <el-table-column prop="contract_quantity" label="合同数量" width="80" align="center" />
            <el-table-column prop="product_unit" label="单位" width="50" align="center" />
            <el-table-column prop="already_shipped_quantity" label="已发" width="60" align="center" />
            <el-table-column label="待发" width="60" align="center">
              <template #default="{ row }">{{ row.remaining_quantity }}</template>
            </el-table-column>
            <el-table-column label="本次发货" width="120" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.this_shipment_quantity"
                  :min="0"
                  :max="row.remaining_quantity"
                  :precision="0"
                  :step="1"
                  size="small"
                  style="width: 100%"
                  :disabled="row.remaining_quantity <= 0"
                />
              </template>
            </el-table-column>
            <el-table-column prop="unit_price" label="单价" width="80" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.unit_price) }}</template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="right">
              <template #default="{ row }">
                <span class="amount-highlight">¥{{ formatMoney(row.this_shipment_quantity * row.unit_price) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="shipment-summary">
            本次发货金额：<span class="amount-highlight">¥{{ formatMoney(shipmentTotalAmount) }}</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipmentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShipment" :loading="shipmentSubmitting">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 开票对话框 -->
    <el-dialog
      v-model="invoiceDialogVisible"
      title="开票"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="invoiceForm" :rules="invoiceFormRules" ref="invoiceFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票类型" prop="invoiceType">
              <el-select v-model="invoiceForm.invoiceType" placeholder="请选择发票类型" style="width: 100%">
                <el-option label="增值税专票" value="special" />
                <el-option label="增值税普票" value="normal" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票金额" prop="invoiceAmount">
              <el-input-number
                v-model="invoiceForm.invoiceAmount"
                :min="0.01"
                :max="uninvoicedAmount"
                :precision="2"
                :step="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票号码" prop="invoiceNo">
              <el-input v-model="invoiceForm.invoiceNo" placeholder="请输入发票号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票日期" prop="invoiceDate">
              <el-date-picker
                v-model="invoiceForm.invoiceDate"
                type="date"
                placeholder="选择开票日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="发票抬头" prop="invoiceTitle">
          <el-input v-model="invoiceForm.invoiceTitle" placeholder="请输入发票抬头" />
        </el-form-item>
        <el-form-item label="税号">
          <el-input v-model="invoiceForm.taxNumber" placeholder="请输入税号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="invoiceForm.invoiceNote" type="textarea" :rows="2" placeholder="请输入备注（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="invoiceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInvoice" :loading="invoiceSubmitting">确认开票</el-button>
      </template>
    </el-dialog>

    <!-- 发起售后对话框 -->
    <el-dialog
      v-model="serviceTicketDialogVisible"
      title="发起售后"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="serviceTicketForm" :rules="serviceTicketFormRules" ref="serviceTicketFormRef" label-width="100px">
        <el-form-item label="售后类型" prop="ticketType">
          <el-select v-model="serviceTicketForm.ticketType" placeholder="请选择售后类型" style="width: 100%">
            <el-option label="故障报修" value="repair" />
            <el-option label="技术咨询" value="consultation" />
            <el-option label="安装调试" value="installation" />
            <el-option label="配件更换" value="parts_replacement" />
            <el-option label="退换货" value="return" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="售后产品" prop="productIds">
          <el-select
            v-model="serviceTicketForm.productIds"
            placeholder="请选择产品（可多选）"
            style="width: 100%"
            multiple
            @change="handleServiceProductChange"
          >
            <el-option
              v-for="item in contract.items"
              :key="item.product_id"
              :label="`${item.product_name}（${item.product_code}）`"
              :value="item.product_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" prop="problemDescription">
          <el-input
            v-model="serviceTicketForm.problemDescription"
            type="textarea"
            :rows="4"
            placeholder="请详细描述问题"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预估费用">
              <el-input-number
                v-model="serviceTicketForm.estimatedCost"
                :min="0"
                :precision="2"
                :step="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期望解决日期">
              <el-date-picker
                v-model="serviceTicketForm.expectedResolveDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="serviceTicketDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitServiceTicket" :loading="serviceTicketSubmitting">确认发起</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getContractDetail,
  addContractTrackRecord,
  confirmContract,
  sendOutContract,
  receiveBackContract,
  voidContract,
  restoreContract
} from '@/api/contracts'
import { createPayment } from '@/api/payments'
import { createShipment } from '@/api/shipments'
import { createInvoice, confirmInvoice, voidInvoice } from '@/api/invoices'
import { createServiceTicket } from '@/api/serviceTickets'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  contractId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'refresh', 'edit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const activeTab = ref('basic')

// 合同数据
const contract = ref({})
const paymentStagesStatus = ref([])
const payments = ref([])
const shipments = ref([])
const invoices = ref([])
const trackRecords = ref([])

// 跟踪记录表单
const trackDialogVisible = ref(false)
const trackSubmitting = ref(false)
const trackFormRef = ref(null)
const trackForm = reactive({
  followType: '',
  content: ''
})
const trackFormRules = {
  followType: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入记录内容', trigger: 'blur' }]
}

// 状态操作表单
const statusDialogVisible = ref(false)
const statusDialogTitle = ref('')
const statusSubmitting = ref(false)
const currentStatusAction = ref('')
const statusForm = reactive({
  notes: ''
})

// 寄出表单
const sendOutDialogVisible = ref(false)
const sendOutForm = reactive({
  trackingNo: '',
  notes: ''
})

// 阶段付款表单
const paymentDialogVisible = ref(false)
const paymentDialogTitle = ref('')
const paymentSubmitting = ref(false)
const paymentFormRef = ref(null)
const paymentForm = reactive({
  stageIndex: 0,
  stageName: '',
  stageAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  paymentAmount: 0,
  paymentMethod: '银行电汇',
  bankAccount: '',
  transactionNo: '',
  paymentDate: '',
  notes: '',
  attachments: []
})
const paymentFormRules = {
  paymentAmount: [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  paymentDate: [{ required: true, message: '请选择收款日期', trigger: 'change' }]
}

// 发货表单
const shipmentDialogVisible = ref(false)
const shipmentSubmitting = ref(false)
const shipmentFormRef = ref(null)
const shipmentForm = reactive({
  logisticsCompany: '',
  trackingNo: '',
  contactPerson: '',
  contactPhone: '',
  shippingAddress: '',
  notes: '',
  items: []
})
const shipmentFormRules = {}

// 是否有未发货的产品
const hasUnshippedItems = computed(() => {
  if (!contract.value.items || contract.value.items.length === 0) return false
  return contract.value.items.some(item => (item.quantity - (item.shipped_quantity || 0)) > 0)
})

// 本次发货总金额
const shipmentTotalAmount = computed(() => {
  if (!shipmentForm.items || shipmentForm.items.length === 0) return 0
  return shipmentForm.items.reduce((sum, item) => {
    return sum + (item.this_shipment_quantity || 0) * (item.unit_price || 0)
  }, 0)
})

// 开票表单
const invoiceDialogVisible = ref(false)
const invoiceSubmitting = ref(false)
const invoiceFormRef = ref(null)
const invoiceForm = reactive({
  invoiceType: 'normal',
  invoiceAmount: 0,
  invoiceNo: '',
  invoiceTitle: '',
  taxNumber: '',
  invoiceDate: '',
  invoiceNote: ''
})
const invoiceFormRules = {
  invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
  invoiceAmount: [{ required: true, message: '请输入开票金额', trigger: 'blur' }],
  invoiceNo: [{ required: true, message: '请输入发票号码', trigger: 'blur' }],
  invoiceTitle: [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
  invoiceDate: [{ required: true, message: '请选择开票日期', trigger: 'change' }]
}

// 售后表单
const serviceTicketDialogVisible = ref(false)
const serviceTicketSubmitting = ref(false)
const serviceTicketFormRef = ref(null)
const serviceTicketForm = reactive({
  ticketType: 'repair',
  productIds: [],
  problemDescription: '',
  estimatedCost: 0,
  expectedResolveDate: ''
})
const serviceTicketFormRules = {
  ticketType: [{ required: true, message: '请选择售后类型', trigger: 'change' }],
  productIds: [{ required: true, message: '请选择售后产品', trigger: 'change', type: 'array', min: 1 }],
  problemDescription: [{ required: true, message: '请输入问题描述', trigger: 'blur' }]
}

// 是否可以发起售后（有发货记录且有付款记录）
const canInitiateServiceTicket = computed(() => {
  const hasShipments = shipments.value && shipments.value.length > 0
  const hasPayments = payments.value && payments.value.length > 0
  const notVoided = contract.value.status !== 'voided'
  return hasShipments && hasPayments && notVoided
})

// 待开票金额
const uninvoicedAmount = computed(() => {
  const total = parseFloat(contract.value.contract_amount) || 0
  const invoiced = parseFloat(contract.value.invoiced_amount) || 0
  return Math.max(0, total - invoiced)
})

// 是否有待开票金额
const hasUninvoicedAmount = computed(() => {
  return uninvoicedAmount.value > 0
})

const progress = reactive({
  contractAmount: 0,
  shippedAmount: 0,
  shippedPercent: 0,
  receivedAmount: 0,
  receivedPercent: 0,
  invoicedAmount: 0,
  invoicedPercent: 0,
  pendingAmount: 0
})

// 计算状态步骤
const statusStep = computed(() => {
  const statusMap = {
    'draft': 0,
    'pending': 1,
    'active': 2,
    'completed': 3,
    'cancelled': 0
  }
  return statusMap[contract.value.status] || 0
})

// 监听contractId变化
watch(() => props.contractId, async (newId) => {
  if (newId && visible.value) {
    await fetchContractDetail(newId)
  }
}, { immediate: true })

watch(visible, async (val) => {
  if (val && props.contractId) {
    activeTab.value = 'basic'
    await fetchContractDetail(props.contractId)
  }
})

// 获取合同详情
const fetchContractDetail = async (id) => {
  loading.value = true
  try {
    const res = await getContractDetail(id)
    const data = res.data

    contract.value = data.contract || {}
    paymentStagesStatus.value = data.paymentStagesStatus || []
    payments.value = data.payments || []
    shipments.value = data.shipments || []
    invoices.value = data.invoices || []
    trackRecords.value = data.trackRecords || []

    // 更新进度
    if (data.progress) {
      Object.assign(progress, data.progress)
    }
  } catch (error) {
    console.error('获取合同详情失败:', error)
    ElMessage.error('获取合同详情失败')
  } finally {
    loading.value = false
  }
}

// 格式化金额
const formatMoney = (value) => {
  const num = parseFloat(value) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 获取渠道标签
const getChannelLabel = (channel) => {
  if (!channel) return '-'
  const channelMap = {
    'website': '官网',
    'referral': '转介绍',
    'exhibition': '展会',
    'cold_call': '陌拜电话',
    'social_media': '社交媒体',
    'advertisement': '广告',
    'partner': '合作伙伴',
    '老客户复购': '老客户复购',
    'other': '其他'
  }
  return channelMap[channel] || channel
}

// 状态类型
const getStatusType = (status) => {
  const map = {
    'draft': 'info',
    'pending': 'warning',
    'sent': 'primary',
    'active': 'success',
    'completed': 'success',
    'voided': 'danger',
    'cancelled': 'danger'
  }
  return map[status] || 'info'
}

// 状态标签
const getStatusLabel = (status) => {
  const map = {
    'draft': '草稿',
    'pending': '已确认',
    'sent': '已寄出',
    'active': '已收回',
    'completed': '已完成',
    'voided': '已作废',
    'cancelled': '已取消'
  }
  return map[status] || status
}

// 添加收款
const handleAddPayment = () => {
  // 如果有付款阶段，提示点击阶段付款
  if (paymentStagesStatus.value && paymentStagesStatus.value.length > 0) {
    ElMessage.info('请点击付款阶段的"付款"按钮进行收款')
  } else {
    ElMessage.info('暂无付款阶段信息')
  }
}

// 阶段付款
const handleStagePayment = (stage, index) => {
  const remaining = (stage.amount || 0) - (stage.paid_amount || 0)
  if (remaining <= 0) {
    ElMessage.warning('该阶段已付款完成')
    return
  }

  // 获取合同约定的付款方式和收款账户
  const paymentTerms = contract.value.payment_terms || {}
  const defaultMethod = paymentTerms.payment_method || '银行电汇'

  // 优先从payment_terms获取，其次从合同乙方信息获取
  const bankInfo = paymentTerms.bank_account || {}
  let defaultBankAccount = ''
  if (bankInfo.bank && bankInfo.account) {
    defaultBankAccount = `${bankInfo.bank} ${bankInfo.account}`
  } else if (contract.value.party_b_bank_name && contract.value.party_b_bank_account) {
    defaultBankAccount = `${contract.value.party_b_bank_name} ${contract.value.party_b_bank_account}`
  }

  // 设置表单数据
  paymentForm.stageIndex = index + 1
  paymentForm.stageName = stage.name || `第${index + 1}期`
  paymentForm.stageAmount = stage.amount || 0
  paymentForm.paidAmount = stage.paid_amount || 0
  paymentForm.remainingAmount = remaining
  paymentForm.paymentAmount = remaining // 默认全额
  paymentForm.paymentMethod = defaultMethod
  paymentForm.bankAccount = defaultBankAccount
  paymentForm.transactionNo = ''
  paymentForm.paymentDate = new Date().toISOString().split('T')[0]
  paymentForm.notes = ''
  paymentForm.attachments = []

  paymentDialogTitle.value = `收款 - ${paymentForm.stageName}`
  paymentDialogVisible.value = true
}

// 提交阶段收款
const submitStagePayment = async () => {
  if (!paymentFormRef.value) return

  try {
    await paymentFormRef.value.validate()
    paymentSubmitting.value = true

    // 调用创建收款记录API
    await createPayment({
      contract_id: props.contractId,
      customer_id: contract.value.customer_id,
      payment_stage: paymentForm.stageName,
      payment_amount: paymentForm.paymentAmount,
      payment_method: paymentForm.paymentMethod,
      bank_account: paymentForm.bankAccount,
      transaction_no: paymentForm.transactionNo,
      payment_date: paymentForm.paymentDate,
      payment_note: paymentForm.notes
    })

    // 添加跟踪记录
    await addContractTrackRecord(props.contractId, {
      followType: 'payment',
      content: `收款 ¥${paymentForm.paymentAmount.toFixed(2)}（${paymentForm.stageName}），方式：${paymentForm.paymentMethod}${paymentForm.transactionNo ? '，流水号：' + paymentForm.transactionNo : ''}`
    })

    ElMessage.success('收款成功')
    paymentDialogVisible.value = false

    // 重新加载合同详情以更新付款阶段状态
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('收款失败:', error)
    ElMessage.error(error.response?.data?.message || '收款失败')
  } finally {
    paymentSubmitting.value = false
  }
}

// 添加发货
const handleAddShipment = () => {
  if (!contract.value.items || contract.value.items.length === 0) {
    ElMessage.warning('暂无产品明细')
    return
  }

  // 初始化发货表单
  shipmentForm.logisticsCompany = ''
  shipmentForm.trackingNo = ''
  shipmentForm.contactPerson = contract.value.party_a_representative || ''
  shipmentForm.contactPhone = contract.value.party_a_phone || ''
  shipmentForm.shippingAddress = contract.value.delivery_address || contract.value.project_address || ''
  shipmentForm.notes = ''

  // 填充发货明细 - 只包含有未发货数量的产品
  shipmentForm.items = contract.value.items
    .filter(item => (item.quantity - (item.shipped_quantity || 0)) > 0)
    .map(item => ({
      item_id: item.item_id,
      contract_item_id: item.item_id,
      product_id: item.product_id,
      product_code: item.product_code,
      product_name: item.product_name,
      product_unit: item.product_unit,
      contract_quantity: item.quantity,
      already_shipped_quantity: item.shipped_quantity || 0,
      remaining_quantity: item.quantity - (item.shipped_quantity || 0),
      this_shipment_quantity: item.quantity - (item.shipped_quantity || 0), // 默认发全部未发数量
      unit_price: item.unit_price
    }))

  if (shipmentForm.items.length === 0) {
    ElMessage.warning('所有产品已发货完成')
    return
  }

  shipmentDialogVisible.value = true
}

// 提交发货
const submitShipment = async () => {
  // 检查是否有发货数量
  const hasShipmentQty = shipmentForm.items.some(item => item.this_shipment_quantity > 0)
  if (!hasShipmentQty) {
    ElMessage.warning('请至少填写一个产品的发货数量')
    return
  }

  shipmentSubmitting.value = true
  try {
    // 只提交有发货数量的明细
    const itemsToShip = shipmentForm.items
      .filter(item => item.this_shipment_quantity > 0)
      .map(item => ({
        contract_item_id: item.contract_item_id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        product_unit: item.product_unit,
        contract_quantity: item.contract_quantity,
        already_shipped_quantity: item.already_shipped_quantity,
        this_shipment_quantity: item.this_shipment_quantity,
        remaining_quantity: item.remaining_quantity - item.this_shipment_quantity,
        unit_price: item.unit_price
      }))

    await createShipment({
      contract_id: props.contractId,
      logistics_company: shipmentForm.logisticsCompany,
      tracking_no: shipmentForm.trackingNo,
      contact_person: shipmentForm.contactPerson,
      contact_phone: shipmentForm.contactPhone,
      shipping_address: shipmentForm.shippingAddress,
      notes: shipmentForm.notes,
      items: itemsToShip
    })

    ElMessage.success('发货成功')
    shipmentDialogVisible.value = false

    // 重新加载合同详情
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('发货失败:', error)
    ElMessage.error(error.response?.data?.message || '发货失败')
  } finally {
    shipmentSubmitting.value = false
  }
}

// 添加发票
const handleAddInvoice = () => {
  if (!hasUninvoicedAmount.value) {
    ElMessage.warning('已开票完成，无待开票金额')
    return
  }

  // 根据合同信息预填发票表单
  invoiceForm.invoiceType = contract.value.invoice_type === 'special' ? 'special' : 'normal'
  invoiceForm.invoiceAmount = uninvoicedAmount.value // 默认开全部待开票金额
  invoiceForm.invoiceNo = '' // 需要手动填写发票号码
  invoiceForm.invoiceTitle = contract.value.invoice_company || contract.value.party_a_name || ''
  invoiceForm.taxNumber = contract.value.invoice_tax_id || ''
  invoiceForm.invoiceDate = new Date().toISOString().split('T')[0]
  invoiceForm.invoiceNote = contract.value.invoice_remark || ''

  invoiceDialogVisible.value = true
}

// 提交开票
const submitInvoice = async () => {
  if (!invoiceFormRef.value) return

  try {
    await invoiceFormRef.value.validate()
    invoiceSubmitting.value = true

    // 调用创建发票API
    await createInvoice({
      contract_id: props.contractId,
      customer_id: contract.value.customer_id,
      invoice_no: invoiceForm.invoiceNo,
      invoice_type: invoiceForm.invoiceType,
      invoice_amount: invoiceForm.invoiceAmount,
      invoice_title: invoiceForm.invoiceTitle,
      tax_number: invoiceForm.taxNumber,
      invoice_date: invoiceForm.invoiceDate,
      invoice_note: invoiceForm.invoiceNote,
      status: 'confirmed' // 直接确认开票
    })

    // 添加跟踪记录
    await addContractTrackRecord(props.contractId, {
      followType: 'invoice',
      content: `开票 ¥${invoiceForm.invoiceAmount.toFixed(2)}，${invoiceForm.invoiceType === 'special' ? '增值税专票' : '增值税普票'}，抬头：${invoiceForm.invoiceTitle}`
    })

    ElMessage.success('开票成功')
    invoiceDialogVisible.value = false

    // 重新加载合同详情
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('开票失败:', error)
    ElMessage.error(error.response?.data?.message || '开票失败')
  } finally {
    invoiceSubmitting.value = false
  }
}

// 确认发票
const handleConfirmInvoice = async (invoice) => {
  try {
    await ElMessageBox.confirm('确认要将此发票标记为已开票吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await confirmInvoice(invoice.invoice_id)
    ElMessage.success('确认成功')

    // 重新加载合同详情
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认发票失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 作废发票
const handleVoidInvoice = async (invoice) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入作废原因', '作废发票', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入作废原因'
    })

    await voidInvoice(invoice.invoice_id, { reason })

    // 添加跟踪记录
    await addContractTrackRecord(props.contractId, {
      followType: 'invoice',
      content: `作废发票 ${invoice.invoice_no}，金额 ¥${invoice.invoice_amount}，原因：${reason}`
    })

    ElMessage.success('作废成功')

    // 重新加载合同详情
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('作废发票失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 发起售后
const handleInitiateServiceTicket = () => {
  // 重置表单
  serviceTicketForm.ticketType = 'repair'
  serviceTicketForm.productIds = []
  serviceTicketForm.problemDescription = ''
  serviceTicketForm.estimatedCost = 0
  serviceTicketForm.expectedResolveDate = ''

  serviceTicketDialogVisible.value = true
}

// 选择售后产品时（多选）
const handleServiceProductChange = (productIds) => {
  // 多选模式，不需要额外处理
}

// 获取售后类型标签
const getTicketTypeLabel = (type) => {
  const map = {
    'repair': '故障报修',
    'consultation': '技术咨询',
    'installation': '安装调试',
    'parts_replacement': '配件更换',
    'return': '退换货',
    'other': '其他'
  }
  return map[type] || type
}

// 提交售后工单
const submitServiceTicket = async () => {
  if (!serviceTicketFormRef.value) return

  try {
    await serviceTicketFormRef.value.validate()
    serviceTicketSubmitting.value = true

    // 获取选中的产品信息
    const selectedProducts = contract.value.items?.filter(i => serviceTicketForm.productIds.includes(i.product_id)) || []
    const productNames = selectedProducts.map(p => p.product_name).join('、')
    const productCodes = selectedProducts.map(p => p.product_code).join('、')

    // 创建售后工单
    const ticketData = {
      customer_id: contract.value.customer_id,
      contract_id: props.contractId,
      product_ids: serviceTicketForm.productIds,
      product_name: productNames,
      product_code: productCodes,
      ticket_type: serviceTicketForm.ticketType,
      ticket_title: `${getTicketTypeLabel(serviceTicketForm.ticketType)} - ${productNames}`,
      priority: 'medium',
      problem_description: serviceTicketForm.problemDescription,
      total_cost: serviceTicketForm.estimatedCost,
      expected_resolve_date: serviceTicketForm.expectedResolveDate
    }

    const res = await createServiceTicket(ticketData)
    const ticketNo = res.data?.ticket_no || res.data?.ticketNo || '新工单'

    // 添加合同跟踪记录
    await addContractTrackRecord(props.contractId, {
      followType: 'service_ticket',
      content: `发起售后工单 ${ticketNo}，类型：${getTicketTypeLabel(serviceTicketForm.ticketType)}，产品：${productNames}，预估费用：¥${(serviceTicketForm.estimatedCost || 0).toFixed(2)}`
    })

    ElMessage.success('售后工单创建成功')
    serviceTicketDialogVisible.value = false

    // 重新加载合同详情
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('创建售后工单失败:', error)
    ElMessage.error(error.response?.data?.message || '创建售后工单失败')
  } finally {
    serviceTicketSubmitting.value = false
  }
}

// 跟踪记录类型标签
const getTrackTypeLabel = (type) => {
  const map = {
    'created': '合同创建',
    'sent_out': '合同寄出',
    'received_back': '合同收回',
    'payment': '付款记录',
    'invoice': '发票记录',
    'shipment': '发货记录',
    'service_ticket': '发起售后',
    'status_change': '状态变更',
    'other': '其他'
  }
  return map[type] || type
}

// 跟踪记录类型颜色
const getTrackTypeColor = (type) => {
  const map = {
    'created': 'success',
    'sent_out': 'primary',
    'received_back': 'success',
    'payment': 'warning',
    'invoice': 'info',
    'shipment': 'primary',
    'service_ticket': 'danger',
    'status_change': 'danger',
    'other': 'info'
  }
  return map[type] || 'info'
}

// 添加跟踪记录
const handleAddTrackRecord = () => {
  trackForm.followType = ''
  trackForm.content = ''
  trackDialogVisible.value = true
}

// 提交跟踪记录
const submitTrackRecord = async () => {
  if (!trackFormRef.value) return

  try {
    await trackFormRef.value.validate()
    trackSubmitting.value = true

    await addContractTrackRecord(props.contractId, {
      followType: trackForm.followType,
      content: trackForm.content
    })

    ElMessage.success('添加成功')
    trackDialogVisible.value = false

    // 重新加载合同详情
    await fetchContractDetail(props.contractId)
  } catch (error) {
    if (error !== false) {
      console.error('添加跟踪记录失败:', error)
      ElMessage.error('添加失败')
    }
  } finally {
    trackSubmitting.value = false
  }
}

// 编辑合同
const handleEdit = () => {
  visible.value = false
  emit('edit', contract.value)
}

// 确认合同
const handleConfirm = () => {
  currentStatusAction.value = 'confirm'
  statusDialogTitle.value = '确认合同'
  statusForm.notes = ''
  statusDialogVisible.value = true
}

// 寄出合同
const handleSendOut = () => {
  sendOutForm.trackingNo = ''
  sendOutForm.notes = ''
  sendOutDialogVisible.value = true
}

// 收回合同
const handleReceiveBack = () => {
  currentStatusAction.value = 'receiveBack'
  statusDialogTitle.value = '收回合同'
  statusForm.notes = ''
  statusDialogVisible.value = true
}

// 作废合同
const handleVoid = () => {
  currentStatusAction.value = 'void'
  statusDialogTitle.value = '作废合同'
  statusForm.notes = ''
  statusDialogVisible.value = true
}

// 恢复合同
const handleRestore = async () => {
  try {
    await ElMessageBox.confirm('确定要恢复该合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await restoreContract(props.contractId)
    ElMessage.success('恢复成功')
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复合同失败:', error)
      ElMessage.error('恢复失败')
    }
  }
}

// 提交状态变更
const submitStatusChange = async () => {
  statusSubmitting.value = true
  try {
    const data = { notes: statusForm.notes }

    if (currentStatusAction.value === 'confirm') {
      await confirmContract(props.contractId, data)
      ElMessage.success('确认成功')
    } else if (currentStatusAction.value === 'receiveBack') {
      await receiveBackContract(props.contractId, data)
      ElMessage.success('收回成功')
    } else if (currentStatusAction.value === 'void') {
      await voidContract(props.contractId, data)
      ElMessage.success('作废成功')
    }

    statusDialogVisible.value = false
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('状态变更失败:', error)
    ElMessage.error('操作失败')
  } finally {
    statusSubmitting.value = false
  }
}

// 提交寄出
const submitSendOut = async () => {
  statusSubmitting.value = true
  try {
    await sendOutContract(props.contractId, {
      trackingNo: sendOutForm.trackingNo,
      notes: sendOutForm.notes
    })
    ElMessage.success('寄出成功')
    sendOutDialogVisible.value = false
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('寄出合同失败:', error)
    ElMessage.error('操作失败')
  } finally {
    statusSubmitting.value = false
  }
}
</script>

<style scoped>
.contract-detail {
  padding: 0 10px;
}

.status-progress {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.progress-cards {
  margin-bottom: 20px;
}

.progress-card {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.progress-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.progress-amount {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.detail-tabs {
  margin-top: 16px;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.amount-highlight {
  color: #e74c3c;
  font-weight: 600;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tab-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.payment-stages {
  margin-bottom: 20px;
}

.payment-records {
  margin-top: 20px;
}

.track-record-item {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.record-operator {
  font-size: 12px;
  color: #909399;
}

.record-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

.action-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.form-info {
  margin-left: 15px;
  color: #606266;
  font-size: 13px;
}

.text-success {
  color: #67c23a;
}

.shipment-items-section {
  margin-bottom: 24px;
}

.shipment-records-section {
  margin-top: 24px;
}

.shipment-summary {
  margin-top: 12px;
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.invoice-requirements {
  margin-bottom: 24px;
}

.invoice-records {
  margin-top: 24px;
}
</style>
