<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="胶卷id" prop="filmId">
      <el-input v-model="dataForm.filmId" placeholder="胶卷id"></el-input>
    </el-form-item>
    <el-form-item label="打印纸id" prop="paperId">
      <el-input v-model="dataForm.paperId" placeholder="打印纸id"></el-input>
    </el-form-item>
    <el-form-item label="打印文件" prop="printUrl">
      <el-input v-model="dataForm.printUrl" placeholder="打印文件"></el-input>
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-input v-model="dataForm.status" placeholder="状态"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间"></el-input>
    </el-form-item>
    <el-form-item label="最近导出时间" prop="outTime">
      <el-input v-model="dataForm.outTime" placeholder="最近导出时间"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          filmId: '',
          paperId: '',
          printUrl: '',
          status: '',
          createTime: '',
          outTime: ''
        },
        dataRule: {
          filmId: [
            { required: true, message: '胶卷id不能为空', trigger: 'blur' }
          ],
          paperId: [
            { required: true, message: '打印纸id不能为空', trigger: 'blur' }
          ],
          printUrl: [
            { required: true, message: '打印文件不能为空', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '状态不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '创建时间不能为空', trigger: 'blur' }
          ],
          outTime: [
            { required: true, message: '最近导出时间不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/generator/printrecord/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.filmId = data.printRecord.filmId
                this.dataForm.paperId = data.printRecord.paperId
                this.dataForm.printUrl = data.printRecord.printUrl
                this.dataForm.status = data.printRecord.status
                this.dataForm.createTime = data.printRecord.createTime
                this.dataForm.outTime = data.printRecord.outTime
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
              url: this.$http.adornUrl(`/generator/printrecord/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'filmId': this.dataForm.filmId,
                'paperId': this.dataForm.paperId,
                'printUrl': this.dataForm.printUrl,
                'status': this.dataForm.status,
                'createTime': this.dataForm.createTime,
                'outTime': this.dataForm.outTime
              })
            }).then(({data}) => {
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
