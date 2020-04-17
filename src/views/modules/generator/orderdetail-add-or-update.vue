<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">
    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">
      <el-form-item label="订单id"
                    prop="orderId">
        <el-input v-model="dataForm.orderId"
                  placeholder="订单id"></el-input>
        <remoteSelect :model="dataForm"
                      type="order"
                      fild="orderId"
                      label="exCode"
                      value="id"
                      @change="orderIdChange"></remoteSelect>
      </el-form-item>
      <el-form-item label="胶卷id"
                    prop="filmId">
        <el-input v-model="dataForm.filmId"
                  placeholder="胶卷id"></el-input>
        <remoteSelect :model="dataForm"
                      type="film"
                      fild="filmId"
                      label="name"
                      value="id"
                      @change="filmIdChange"></remoteSelect>
      </el-form-item>
      <el-form-item label="数量"
                    prop="number">
        <el-input v-model="dataForm.number"
                  placeholder="数量"></el-input>
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
  components: {
    remoteSelect
  },
  data () {
    return {
      visible: false,
      dataForm: {
        id: 0,
        orderId: '',
        filmId: '',
        status: '',
        imgs: '',
        printUrl: '',
        printWidth: '',
        printHeight: '',
        number: ''
      },
      dataRule: {
        orderId: [
          { required: true, message: '订单id不能为空', trigger: 'blur' }
        ],
        filmId: [
          { required: true, message: '胶卷id不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '胶卷状态不能为空', trigger: 'blur' }
        ],
        imgs: [
          { required: true, message: '图片集不能为空', trigger: 'blur' }
        ],
        printUrl: [
          { required: true, message: '打印文件不能为空', trigger: 'blur' }
        ],
        printWidth: [
          { required: true, message: '打印文件宽度不能为空', trigger: 'blur' }
        ],
        printHeight: [
          { required: true, message: '打印文件高度不能为空', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '数量不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    orderIdChange (value) {
      this.dataForm.orderId = value
    },
    filmIdChange (value) {
      this.dataForm.filmId = value
    },
    init (id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/generator/orderdetail/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.orderId = data.orderDetail.orderId
              this.dataForm.filmId = data.orderDetail.filmId
              this.dataForm.status = data.orderDetail.status
              this.dataForm.imgs = data.orderDetail.imgs
              this.dataForm.printUrl = data.orderDetail.printUrl
              this.dataForm.printWidth = data.orderDetail.printWidth
              this.dataForm.printHeight = data.orderDetail.printHeight
              this.dataForm.number = data.orderDetail.number
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
            url: this.$http.adornUrl(`/generator/orderdetail/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'orderId': this.dataForm.orderId,
              'filmId': this.dataForm.filmId,
              'status': this.dataForm.status,
              'imgs': this.dataForm.imgs,
              'printUrl': this.dataForm.printUrl,
              'printWidth': this.dataForm.printWidth,
              'printHeight': this.dataForm.printHeight,
              'number': this.dataForm.number
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
