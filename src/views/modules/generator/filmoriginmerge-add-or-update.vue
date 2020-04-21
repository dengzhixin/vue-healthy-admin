<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">
    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">
      <el-form-item label="店铺"
                    prop="originId">
        <remoteSelect :model="dataForm"
                      type="origin"
                      fild="originId"
                      label="origin"
                      value="id"
                      @change="originIdChange">
        </remoteSelect>
      </el-form-item>
      <el-form-item label="胶卷标识"
                    prop="marker">
        <el-input v-model="dataForm.marker"
                  placeholder="胶卷标识"></el-input>
      </el-form-item>
      <el-form-item label="胶卷模板"
                    prop="filmId">
        <remoteSelect :model="dataForm"
                      fild="filmId"
                      type="film"
                      label="name"
                      value="id"
                      @change="filmIdChange"></remoteSelect>
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
import remoteSelect from '../../common/remoteSelect'
export default {
  name: 'merge',
  components: {
    remoteSelect
  },
  data () {
    return {
      filmSelect: {
        options: [],
        loading: false
      },
      visible: false,
      dataForm: {
        id: undefined,
        originId: undefined,
        marker: '',
        filmId: undefined
      },
      dataRule: {
        originId: [
          { required: true, message: '来源地不能为空', trigger: 'blur' }
        ],
        marker: [
          { required: true, message: '胶卷标识不能为空', trigger: 'blur' }
        ],
        filmId: [
          { required: true, message: '胶卷模板不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    filmIdChange (value) {
      this.dataForm.filmId = value
    },
    originIdChange (value) {
      this.dataForm.originId = value
    },
    remoteFilmMethod (query) {
      this.filmSelect.loading = true
      this.$http({
        url: this.$http.adornUrl('/generator/film/list'),
        method: 'get',
        params: this.$http.adornParams({
          'key': query
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.filmSelect.options = data.page.list
        } else {
          this.filmSelect.options = []
        }
        this.filmSelect.loading = false
      })
    },
    init (id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/generator/filmoriginmerge/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.originId = data.filmOriginMerge.originId
              this.dataForm.marker = data.filmOriginMerge.marker
              this.dataForm.filmId = data.filmOriginMerge.filmId
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
            url: this.$http.adornUrl(`/generator/filmoriginmerge/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'originId': this.dataForm.originId,
              'marker': this.dataForm.marker,
              'filmId': this.dataForm.filmId
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
  },
  mounted () {
  }
}
</script>
