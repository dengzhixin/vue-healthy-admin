<template>
  <el-dialog :title="!dataForm.id ? (dataForm.type==1?'新建订单':'引入订单'): '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">

    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">
      <el-form-item v-if="dataForm.id"
                    label="系统编号"
                    prop="code">
        <el-input :disabled="true"
                  v-model="dataForm.code"
                  placeholder="系统编号"></el-input>
      </el-form-item>
      <el-form-item label="订单号"
                    prop="exCode"
                    v-if="!(!dataForm.id && dataForm.type==1)">
        <el-input :disabled="dataForm.id?true:false"
                  v-model="dataForm.exCode"
                  placeholder="订单号"></el-input>
      </el-form-item>
      <el-form-item label="店铺"
                    prop="originId">
        <remoteSelect v-if="visible"
                      :disabled="dataForm.id?true:false"
                      :model="dataForm"
                      type="origin"
                      fild="originId"
                      label="origin"
                      value="id"
                      @change="originIdChange"></remoteSelect>
      </el-form-item>

      <el-form-item v-if="opType=='卖家备注'"
                    label="卖家备注"
                    prop="sellerMsg">
        <el-input v-model="dataForm.sellerMsg"
                  placeholder="卖家备注"></el-input>
      </el-form-item>

      <el-form-item v-if="dataForm.type==1"
                    label="买家昵称"
                    prop="buyerNick">
        <el-input v-model="dataForm.buyerNick"
                  placeholder="买家昵称"></el-input>
      </el-form-item>
      <el-form-item v-if="opType!='卖家备注'"
                    label="系统备注"
                    prop="remarks">
        <el-input v-model="dataForm.remarks"
                  placeholder="系统备注"></el-input>
      </el-form-item>
      <template v-if="dataForm.type==1">
        <el-form-item label="操作："
                      prop="remarks">
          <el-button style="display:inline-block"
                     @click="addFilm">添加定制品</el-button>
          <el-upload style="display:inline-block"
                     action="#"
                     accept="application/zip"
                     :on-change="uploadImgsZip"
                     :multiple="true"
                     :show-file-list="false"
                     :auto-upload="false">
            <el-button slot="trigger"
                       type="primary">上传定制包</el-button>

          </el-upload>
        </el-form-item>
        <div class="divider"></div>
        <el-form :model="orderDetail"
                 :rules="dataRule"
                 class=""
                 :ref="'orderDetailList'+index"
                 label-width="80px"
                 v-for="(orderDetail,index) in orderDetailList"
                 :key="'orderDetail'+index">
          <i class="icon el-icon-delete"
             @click="deleteOrderDetail(index,orderDetail.id)"></i>

          <el-form-item label="制作模板"
                        style="display:inline-block"
                        prop="filmId">
            <remoteSelect :model="orderDetail"
                          type="film"
                          fild="filmId"
                          label="name"
                          value="id"
                          :index="index"
                          @change="filmIdChange"></remoteSelect>

          </el-form-item>
          <el-form-item label="数量"
                        prop="number"
                        style="display:inline-block">

            <el-input-number v-model="orderDetail.number"
                             :min="1"></el-input-number>
          </el-form-item>

          <div>
            <vuedraggable class="imgs"
                          v-model="orderDetail.imgs">
              <div class="img"
                   v-for="(img,imgIndex) in orderDetail.imgs"
                   :key="img.url">
                <img :src="img.url +'?x-oss-process=style/200x'"
                     :style="'transform:rotate('+90*img.angle+'deg)'"
                     alt="">

                <span>
                  {{imgIndex+1}}
                  <i class="icon el-icon-caret-right"
                     @click="setImgAngle(index,imgIndex)"
                     title="旋转"></i>
                  <i class="icon el-icon-delete"
                     title="删除"
                     @click="deleteImg(index,imgIndex)"></i>
                </span>

              </div>
              <uploadImageCard slot="footer"
                               type="button"
                               buttonText="上传图片"
                               :index="index"
                               :multiple="true"
                               @uploadSuccess="getNewImg"></uploadImageCard>

            </vuedraggable>
          </div>

        </el-form>
      </template>

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
import vuedraggable from 'vuedraggable'
import uploadImageCard from '../../common/uploadImageCard'
import uploadImgsZip from '@/utils/uploadImgsZip.js'
export default {
  components: {
    remoteSelect, vuedraggable, uploadImageCard
  },
  data () {
    return {
      url: '',
      visible: false,
      opType: undefined,
      dataForm: {
        id: undefined,
        code: '',
        exCode: '',
        originId: undefined,
        buyerMsg: '',
        buyerNick: '',
        sellerMsg: '',
        orderCreateTime: '',
        payTime: '',
        createTime: '',
        status: '',
        remarks: ''
      },
      orderDetailList: [],
      dataRule: {
        code: [
          { required: true, message: '系统编号不能为空', trigger: 'blur' }
        ],
        exCode: [
          { required: true, message: '订单号不能为空', trigger: 'blur' }
        ],
        originId: [
          { required: true, message: '店铺不能为空', trigger: 'blur' }
        ],
        filmId: [
          { required: true, message: '制作模板不能为空', trigger: 'blur' }
        ],
        buyerNick: [
          { required: true, message: '买家不能为空', trigger: 'blur' }
        ]

      },
      urls: []
    }
  },
  mounted () {
    this.url = this.$http.adornUrl(`/sys/oss/uploadZip?token=${this.$cookie.get('token')}`)
  },
  methods: {
    getNewImg (response) {
      console.log(response)
      this.orderDetailList[response.index].imgs.push({
        url: response.url,
        number: 1,
        title: ''
      })
    },
    deleteImg (index, imgIndex) {
      this.orderDetailList[index].imgs.splice(imgIndex, 1)
      // this.$forceUpdate()
    },
    setImgAngle (index, imgIndex) {
      let img = this.orderDetailList[index].imgs[imgIndex]
      img.angle = img.angle ? img.angle + 1 : 1
      this.$forceUpdate()
    },
    addFilm () {
      this.orderDetailList.splice(0, 0, {
        filmId: undefined,
        imgs: [],
        number: 1
      })
    },
    deleteOrderDetail (index, id) {
      let callback = () => {
        this.$message({
          message: '操作成功',
          type: 'success',
          duration: 500,
          onClose: () => {
            this.orderDetailList.splice(index, 1)
          }
        })
      }

      this.$confirm(`确定删除？删除后不能回复，请谨慎操作`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (id) {
          this.$http({
            url: this.$http.adornUrl('/generator/orderdetail/delete'),
            method: 'post',
            data: this.$http.adornData([id], false)
          }).then(({ data }) => {
            if (data && data.code === 0) {
              callback()
            } else {
              this.$message.error(data.msg)
            }
          })
        } else {
          callback()
        }
      })
    },
    uploadImgsZip (zip) {
      uploadImgsZip(zip.raw, this).then((imgs) => {
        this.orderDetailList.push({ imgs: imgs, number: 1 })
      })
    },

    filmIdChange (value, index) {
      this.orderDetailList[index].filmId = value
    },
    originIdChange (value) {
      this.dataForm.originId = value
    },
    init (id, type, opType) {
      this.dataForm.id = id || 0
      this.dataForm.type = type
      this.opType = opType
      this.visible = true
      this.orderDetailList = []
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
              this.dataForm.remarks = data.order.remarks
              this.orderDetailList = data.orderDetail.map((orderDetail) => {
                if (orderDetail.imgs == null) {
                  orderDetail.imgs = []
                } else {
                  orderDetail.imgs = JSON.parse(orderDetail.imgs)
                }
                return orderDetail
              })
            }
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      let valid = 0
      this.orderDetailList.forEach((od) => {
        if (od.filmId === undefined || od.imgs.length === 0) {
          valid += 1
        }
      })
      if (valid > 0) {
        this.$message('制作模板或图片不能为空')
        return
      }
      // 人工创建订单
      if (this.dataForm.type === 1 && this.orderDetailList.length === 0) {
        this.$message('订制品不能为空哦')
        return
      }
      let loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let url = '/generator/order/'
      if (!this.dataForm.id) {
        switch (this.dataForm.type) {
          case 0:
            url += 'save'
            break
          case 1:
            url += 'manualCreate'
            break
        }
      } else {
        url += 'update'
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(url),
            method: 'post',
            data: this.$http.adornData(
              {
                'id': this.dataForm.id || undefined,
                'code': this.dataForm.code,
                'exCode': this.dataForm.exCode,
                'originId': this.dataForm.originId,
                'buyerMsg': this.dataForm.buyerMsg,
                'buyerNick': this.dataForm.buyerNick,
                'sellerMsg': this.dataForm.sellerMsg,
                'orderCreateTime': this.dataForm.orderCreateTime,
                'payTime': this.dataForm.payTime,
                'createTime': this.dataForm.createTime,
                'status': this.dataForm.status,
                'remarks': this.dataForm.remarks,
                'list': this.orderDetailList.map((od) => {
                  let obj = JSON.stringify(od)
                  let clone = JSON.parse(obj)
                  clone.imgs = JSON.stringify(clone.imgs)
                  return clone
                })
              }

            )
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1000,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(data.msg)
            }
            loading.close()
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