<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">
    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="100px">
      <el-form-item label="定时任务名"
                    prop="remark">
        <el-input :disabled="true"
                  v-model="dataForm.remark"
                  placeholder="定时任务名"></el-input>
      </el-form-item>
      <!-- <el-form-item label="bean名称"
                    prop="beanName">
        <el-input v-model="dataForm.beanName"
                  placeholder="spring bean名称, 如: testTask"></el-input>
      </el-form-item> -->
      <!-- <el-form-item label="参数"
                    prop="params">
        <el-input v-model="dataForm.params"
                  placeholder="参数"></el-input>
      </el-form-item> -->
      <el-form-item label="周期(小时)"
                    prop="cronExpression">
        <!-- <el-popover v-model="cronPopoverShow">
          <cron @change="changeCron"
                @close="cronPopoverShow=false"></cron>
          <el-input slot="reference"
                    @click="cronPopoverShow=true"
                    v-model="dataForm.cronExpression"
                    placeholder="请输入定时策略"></el-input>
        </el-popover> -->
        <el-input v-model="dataForm.hour"
                  placeholder="请输入间隔时间(小时)"></el-input>
        <!-- <el-input v-model="dataForm.cronExpression"
                  placeholder="请输入定时策略"></el-input> -->
      </el-form-item>

    </el-form>
    <span slot="footer"
          class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary"
                 @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { cron } from 'vue-cron'
export default {
  components: {
    cron
  },
  data () {
    return {
      cronPopoverShow: false,
      visible: false,
      dataForm: {
        id: 0,
        beanName: '',
        params: '',
        cronExpression: '',
        remark: '',
        status: 0,
        hour: 0
      },
      dataRule: {
        beanName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        cronExpression: [
          { required: true, message: 'cron表达式不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    changeCron (val) {
      this.dataForm.cronExpression = val
    },
    init (id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/sys/schedule/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.beanName = data.schedule.beanName
              this.dataForm.params = data.schedule.params
              this.dataForm.cronExpression = data.schedule.cronExpression
              this.dataForm.hour = data.schedule.cronExpression.split(' ')[2].split('/')[1]
              this.dataForm.remark = data.schedule.remark
              this.dataForm.status = data.schedule.status
            }
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/sys/schedule/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'jobId': this.dataForm.id || undefined,
              'beanName': this.dataForm.beanName,
              'params': this.dataForm.params,
              'cronExpression': '0 0 0/' + this.dataForm.hour.trim() + ' * * ?',
              'remark': this.dataForm.remark,
              'status': !this.dataForm.id ? undefined : this.dataForm.status
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    }
  }
}
</script>
