<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">

    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">
      <el-form-item label="胶卷名称"
                    prop="name">
        <el-input v-model="dataForm.name"
                  placeholder="胶卷名称"></el-input>
      </el-form-item>
      <el-form-item label="胶卷底板"
                    prop="bgUrl">
        <uploadImageCard :preImage="dataForm.bgUrl"
                         @uploadSuccess="uploadSuccess"></uploadImageCard>
      </el-form-item>
      <el-form-item label="最大内容宽度"
                    prop="maxContentWidth">
        <el-input v-model.number="dataForm.maxContentWidth"
                  placeholder="最大内容宽度"></el-input>
      </el-form-item>
      <el-form-item label="内容高度"
                    prop="contentHeight">
        <el-input v-model.number="dataForm.contentHeight"
                  placeholder="内容高度"></el-input>
      </el-form-item>
      <el-form-item label="x"
                    prop="x">
        <el-input v-model.number="dataForm.x"
                  placeholder="x"></el-input>
      </el-form-item>
      <el-form-item label="y"
                    prop="y">
        <el-input v-model.number="dataForm.y"
                  placeholder="y"></el-input>
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
  data () {
    return {
      visible: false,
      dataForm: {
        id: 0,
        bgUrl: '',
        maxContentWidth: '',
        contentHeight: '',
        x: '',
        y: '',
        name: ''
      },
      dataRule: {
        bgUrl: [
          { required: true, message: '胶卷底板不能为空', trigger: 'blur' }
        ],
        maxContentWidth: [
          { required: true, message: '最大内容宽度不能为空', trigger: 'blur' },
          { type: 'number', message: '必须为数字' }
        ],
        contentHeight: [
          { required: true, message: '内容高度不能为空', trigger: 'blur' },
          { type: 'number', message: '必须为数字' }
        ],
        x: [
          { required: true, message: 'x不能为空', trigger: 'blur' },
          { type: 'number', message: '必须为数字' }
        ],
        y: [
          { required: true, message: 'y不能为空', trigger: 'blur' },
          { type: 'number', message: '必须为数字' }
        ],
        name: [
          { required: true, message: '胶卷名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  components: {
    uploadImageCard
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
            url: this.$http.adornUrl(`/generator/film/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.bgUrl = data.film.bgUrl
              this.dataForm.maxContentWidth = data.film.maxContentWidth
              this.dataForm.contentHeight = data.film.contentHeight
              this.dataForm.x = data.film.x
              this.dataForm.y = data.film.y
              this.dataForm.name = data.film.name
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
            url: this.$http.adornUrl(`/generator/film/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'bgUrl': this.dataForm.bgUrl,
              'maxContentWidth': this.dataForm.maxContentWidth,
              'contentHeight': this.dataForm.contentHeight,
              'x': this.dataForm.x,
              'y': this.dataForm.y,
              'name': this.dataForm.name
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
