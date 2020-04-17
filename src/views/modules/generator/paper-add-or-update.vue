<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">
    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">
      <el-form-item label="打印纸底板"
                    prop="bgUrl">
        <uploadImageCard :preImage="dataForm.bgUrl"
                         @uploadSuccess="uploadSuccess"></uploadImageCard>
      </el-form-item>
      <el-form-item label="行数"
                    prop="number">
        <el-input v-model="dataForm.number"
                  placeholder="行数"></el-input>
      </el-form-item>
      <el-form-item label="坐标集"
                    prop="xys">
        <el-input v-model="dataForm.xys"
                  placeholder="坐标集"></el-input>
      </el-form-item>
      <el-form-item label="最大胶卷宽度"
                    prop="maxWidth">
        <el-input v-model="dataForm.maxWidth"
                  placeholder="最大胶卷宽度"></el-input>
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
import uploadImageCard from '../../common/uploadImageCard'

export default {
  components: {
    uploadImageCard
  },
  data () {
    return {
      visible: false,
      dataForm: {
        id: 0,
        bgUrl: '',
        number: '',
        xys: '',
        maxWidth: ''
      },
      dataRule: {
        bgUrl: [
          { required: true, message: '打印纸底板不能为空', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '行数不能为空', trigger: 'blur' }
        ],
        xys: [
          { required: true, message: '坐标集不能为空', trigger: 'blur' }
        ],
        maxWidth: [
          { required: true, message: '最大胶卷宽度不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    uploadSuccess (response) {
      this.dataForm.bgUrl = response.url
    },
    init (id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/generator/paper/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.bgUrl = data.paper.bgUrl
              this.dataForm.number = data.paper.number
              this.dataForm.xys = data.paper.xys
              this.dataForm.maxWidth = data.paper.maxWidth
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
            url: this.$http.adornUrl(`/generator/paper/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'bgUrl': this.dataForm.bgUrl,
              'number': this.dataForm.number,
              'xys': this.dataForm.xys,
              'maxWidth': this.dataForm.maxWidth
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
