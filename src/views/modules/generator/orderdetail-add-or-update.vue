<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">

    <template v-if="dataForm.id">
      <el-alert title="若胶卷已经制作，修改后会自动重做，若非必要，请勿随意修改"
                :closable="false"
                type="warning">
      </el-alert>
      <p></p>

    </template>
    <el-form :model="dataForm"
             :rules="dataRule"
             class=""
             ref="dataForm"
             label-width="80px">
      <!-- <i class="icon el-icon-delete"
         @click="deleteOrderDetail(index,dataForm.id)"></i> -->
      <el-form-item style="display:inline-block"
                    label="制作模板"
                    prop="filmId">
        <remoteSelect :model="dataForm"
                      type="film"
                      fild="filmId"
                      label="name"
                      value="id"
                      @change="filmIdChange"></remoteSelect>

      </el-form-item>
      <el-form-item label="图片集"
                    prop="imgs">
        <vuedraggable class="imgs"
                      v-model="dataForm.imgs">
          <div class="img"
               v-for="(img,imgIndex) in dataForm.imgs"
               :key="img.url">
            <img :src="img.url +'?x-oss-process=style/200x'"
                 :style="'transform:rotate('+90*img.angle+'deg)'"
                 alt="">

            <span>
              {{imgIndex+1}}
              <i class="icon el-icon-caret-right"
                 @click="setImgAngle(imgIndex)"
                 title="旋转"></i>
              <i class="icon el-icon-delete"
                 title="删除"
                 @click="deleteImg(imgIndex)"></i>
            </span>

          </div>
          <uploadImageCard slot="footer"
                           type="button"
                           buttonText="上传图片"
                           @uploadSuccess="getNewImg"></uploadImageCard>
          <el-upload v-if="dataForm.imgs==null ||dataForm.imgs.length==0"
                     :action="url"
                     :multiple="false"
                     :on-success="uploadImgsZip"
                     :show-file-list="false">
            <el-button slot="trigger"
                       type="primary">上传图片压缩包</el-button>
          </el-upload>
        </vuedraggable>

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
import JsZip from 'jszip'
import vuedraggable from 'vuedraggable'
import uploadImageCard from '../../common/uploadImageCard'

export default {
  components: {
    remoteSelect, vuedraggable, uploadImageCard
  },
  data () {
    return {
      visible: false,
      url: '',
      dataForm: {
        id: 0,
        orderId: '',
        filmId: '',
        status: '',
        imgs: [],
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
          { required: true, message: '制作模板不能为空', trigger: 'blur' }
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
  mounted () {
    this.url = this.$http.adornUrl(`/sys/oss/uploadZip?token=${this.$cookie.get('token')}`)
  },
  methods: {
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
            return { number: 1, url: u, angle: 0 }
          })

          this.dataForm.imgs.concat(imgs)
        })
    },
    deleteImg (imgIndex) {
      this.dataForm.imgs.splice(imgIndex, 1)
    },
    setImgAngle (imgIndex) {
      let img = this.dataForm.imgs[imgIndex]
      img.angle = img.angle ? img.angle + 1 : 1
      this.dataForm.imgs.splice(imgIndex, 1, img)
    },
    getNewImg (response) {
      this.dataForm.imgs.push({
        url: response.url,
        number: 1
      })
    },
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
              this.dataForm.imgs = JSON.parse(data.orderDetail.imgs)
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
          alert(valid)
          if (this.dataForm.status >= 3) {
            this.dataForm.status = 2
          }
          this.$http({
            url: this.$http.adornUrl(`/generator/orderdetail/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'orderId': this.dataForm.orderId,
              'filmId': this.dataForm.filmId,
              'status': this.dataForm.status,
              'imgs': JSON.stringify(this.dataForm.imgs.map((img) => {
                return Object.assign(img)
              })),
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
<style scoped>
.imgs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.imgs .img {
  margin: 10px;
  display: flex;
  flex-direction: column;
}
.imgs .img span {
  text-align: center;
}
.imgs .img img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
</style>
