<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">

    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">

      <el-form-item label="外部订单编号"
                    prop="exCode">
        <el-input :disabled="dataForm.id?true:false"
                  v-model="dataForm.exCode"
                  placeholder="外部订单编号"></el-input>
      </el-form-item>
      <el-form-item label="来源地"
                    prop="originId">
        <remoteSelect v-if="visible"
                      :model="dataForm"
                      type="origin"
                      fild="originId"
                      label="origin"
                      value="id"
                      @change="originIdChange"></remoteSelect>
      </el-form-item>
      <!-- <el-form-item v-if="!dataForm.id"
                    label="买家留言"
                    prop="buyerMsg">
        <el-input v-model="dataForm.buyerMsg"
                  placeholder="买家留言"></el-input>
      </el-form-item> -->
      <el-form-item label="卖家留言"
                    prop="sellerMsg">
        <el-input v-model="dataForm.sellerMsg"
                  placeholder="卖家留言"></el-input>
      </el-form-item>
      <el-button @click="addFilm">添加胶卷</el-button>
      <el-form :model="orderDetail"
               :rules="dataRule"
               :ref="'orderDetailList'+index"
               label-width="80px"
               v-for="(orderDetail,index) in orderDetailList"
               :key="'orderDetail'+index">
        <el-form-item label="胶卷模板"
                      prop="originId">
          <remoteSelect :model="orderDetail"
                        type="film"
                        fild="filmId"
                        label="name"
                        value="id"
                        :index="index"
                        @change="filmIdChange"></remoteSelect>

        </el-form-item>

        <el-upload v-if="orderDetail.imgs.length=0"
                   action="#"
                   :on-change="uploadImgsZip"
                   :show-file-list="false"
                   :auto-upload="false">
          <el-button slot="trigger"
                     type="primary">上传图片包</el-button>

        </el-upload>
      </el-form>

      <!-- <el-upload :action="url"
                 :multiple="false"
                 :on-success="uploadImgsZip"
                 :show-file-list="false">
        <el-button slot="trigger"
                   type="primary">上传图片包</el-button>
      </el-upload> -->
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
import JsZip from 'jszip'

export default {
  components: {
    remoteSelect
  },
  data () {
    return {
      url: '',
      visible: false,
      dataForm: {
        id: undefined,
        code: '',
        exCode: '',
        originId: undefined,
        buyerMsg: '',
        sellerMsg: '',
        orderCreateTime: '',
        payTime: '',
        createTime: '',
        status: ''
      },
      orderDetailList: [],
      dataRule: {
        code: [
          { required: true, message: '系统内部订单编号不能为空', trigger: 'blur' }
        ],
        exCode: [
          { required: true, message: '外部订单编号不能为空', trigger: 'blur' }
        ],
        originId: [
          { required: true, message: '来源地id不能为空', trigger: 'blur' }
        ]

      },
      urls: []
    }
  },
  mounted () {
    this.url = this.$http.adornUrl(`/sys/oss/uploadZip?token=${this.$cookie.get('token')}`)
  },
  methods: {
    addFilm () {
      this.orderDetailList.push({
        filmId: undefined,
        imgs: []
      })
    },
    uploadImgsZip (zip) {
      let that = this
      var zipUtil = new JsZip()
      let imgFiles = []
      zipUtil.loadAsync(zip.raw)
        .then(function (zfile) {
          let fileNum = Object.keys(zipUtil.files).length
          Object.keys(zipUtil.files).forEach((key) => {
            let file = zfile.files[key]
            console.log(file)
            if (file.dir === false) {
              let name = file.name
              let ff = zipUtil.file(name)
              ff.async('base64').then((base64) => {
                base64 = 'data:image/png;base64,' + base64
                // console.log(base64)
                console.log(base64)
                let f = that.dataURLtoFile(base64, name)
                imgFiles.push(f)
                fileNum -= 1
                if (fileNum === 0) {
                  that.requestUploadFiles(imgFiles)
                }
              })
            } else {
              fileNum -= 1
            }

            //   // var base64 = this.arrayBufferToBase64(buffer)
            //   // console.log(base64)
          })
          console.log(imgFiles)
        })
    },
    requestUploadFiles (files) {
      let param = new FormData() // 创建form对象
      files.forEach((f) => {
        param.append('files', f)// 通过append向form对象添加数据
      })
      let config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      } // 添加请求头
      this.$http.post(this.$http.adornUrl(`/sys/oss/uploads`), param, config)
        .then(({ data }) => {
          // orderDetailList
          let imgs = data.urls.map((u) => {
            return { number: 1, url: u }
          })

          this.orderDetailList.push({ imgs: imgs })
        })
    },
    dataURLtoFile (dataurl, filename) {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
    filmIdChange (value, index) {
      this.orderDetailList[index].filmId = value
    },
    originIdChange (value) {
      this.dataForm.originId = value
    },
    init (id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()

        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/generator/order/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.code = data.order.code
              this.dataForm.exCode = data.order.exCode
              this.dataForm.originId = data.order.originId
              this.dataForm.buyerMsg = data.order.buyerMsg
              this.dataForm.sellerMsg = data.order.sellerMsg
              this.dataForm.orderCreateTime = data.order.orderCreateTime
              this.dataForm.payTime = data.order.payTime
              this.dataForm.createTime = data.order.createTime
              this.dataForm.status = data.order.status
              this.orderDetailList = data.orderDetail.map((orderDetail) => {
                orderDetail.imgs = JSON.parse(orderDetail.imgs)
                return orderDetail
              })
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
            url: this.$http.adornUrl(`/generator/order/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'code': this.dataForm.code,
              'exCode': this.dataForm.exCode,
              'originId': this.dataForm.originId,
              'buyerMsg': this.dataForm.buyerMsg,
              'sellerMsg': this.dataForm.sellerMsg,
              'orderCreateTime': this.dataForm.orderCreateTime,
              'payTime': this.dataForm.payTime,
              'createTime': this.dataForm.createTime,
              'status': this.dataForm.status
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
