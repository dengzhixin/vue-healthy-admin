<template>
  <el-dialog title="批量"
             :close-on-click-modal="false"
             :visible.sync="visible">

    <el-form :model="dataForm"
             ref="dataForm"
             label-width="80px">
      <el-form-item label="店铺"
                    prop="originId">
        <remoteSelect v-if="visible"
                      :model="dataForm"
                      type="origin"
                      fild="originId"
                      label="origin"
                      value="id"
                      @change="originIdChange"></remoteSelect>
      </el-form-item>
      <el-form-item label="操作">
        <el-radio v-model="dataForm.opType"
                  label="设置">设置订单</el-radio>
        <el-radio v-model="dataForm.opType"
                  label="导入">导入新订单</el-radio>

      </el-form-item>
      <el-collapse v-model="activeImportCol"
                   accordion>
        <el-collapse-item title="excel表格导入订单号"
                          name="excel">
          <el-alert title='可以识别表格中”订单编号“、"订单号“所在的列为订单号'
                    :closable="false"
                    type="warning">
          </el-alert>
          <br />
          <el-upload style="display:inline-block"
                     ref="upload"
                     action="#"
                     accept=".xlsx"
                     :multiple="false"
                     :show-file-list="false"
                     :on-change="importExcelOrders"
                     :auto-upload="false">
            <el-button slot="trigger">选择订单excel表格</el-button>

          </el-upload>

        </el-collapse-item>
        <el-collapse-item title="手动输入订单号"
                          name="text">
          <el-form-item label="订单号">
            <el-input type="textarea"
                      :autosize="{ minRows: 4}"
                      clearable
                      placeholder="请输入订单号，换行可以输入多个"
                      @input="inputOrderExcodeChange"
                      v-model="inputOrderExcode">
            </el-input>

          </el-form-item>

        </el-collapse-item>
        <el-collapse-item title="文件夹导入订单和图片"
                          name="dirs"
                          v-if="dataForm.opType=='导入'">
          <el-alert title="请选择一个总文件夹，子文件名为订单号，子文件里面为图片"
                    :closable="false"
                    type="warning"></el-alert>
          <br />
          <el-button class="btn-addFiles">
            <input type="file"
                   webkitdirectory
                   @change="addFileDir"
                   accept="image/*"
                   multiple> 选择一个总文件夹</el-button>
          <!-- <remoteSelect :model="dataForm"
                        type="film"
                        fild="allFilmId"
                        label="name"
                        value="id"
                        @change="allfilmIdChange"></remoteSelect> -->

          <el-collapse>
            <el-collapse-item :title="order.exCode"
                              :name="order.exCode"
                              v-for="(order,oindex) in orders"
                              :key="'order'+oindex">
              <el-form label-width="80px"
                       v-for="(orderDetail,index) in order.list"
                       :key="'orderDetail'+index">
                <el-form-item label="制作模板"
                              style="display:inline-block"
                              prop="filmId">
                  <remoteSelect :model="orderDetail"
                                type="film"
                                fild="filmId"
                                label="name"
                                value="id"
                                :index="index"
                                :oindex="oindex"
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
                           @click="setImgAngle(oindex,index,imgIndex)"
                           title="旋转"></i>
                        <i class="icon el-icon-delete"
                           title="删除"
                           @click="deleteImg(oindex,index,imgIndex)"></i>
                      </span>

                    </div>

                  </vuedraggable>
                </div>

              </el-form>
            </el-collapse-item>

          </el-collapse>

        </el-collapse-item>

      </el-collapse>
      <br />
      <h4>统一操作</h4>
      <el-form-item v-if="isAuth('generator:order:import-sellerMsg')"
                    label="统一设置卖家备注"
                    prop="sellerMsg">
        <el-input type="text"
                  placeholder="请输入卖家备注，会同步到淘宝店"
                  v-model="dataForm.sellerMsg">
        </el-input>
      </el-form-item>

      <el-form-item label="统一设置系统备注"
                    prop="sellerMsg">
        <el-input type="text"
                  placeholder="统一设置系统备注"
                  v-model="dataForm.remarks">
        </el-input>
      </el-form-item>
      <el-form-item label="统一操作">
        <el-checkbox v-model="dataForm.closeMake">禁止制作</el-checkbox>
      </el-form-item>

      <el-button type="primary"
                 @click="dataFormSubmit()">{{dataForm.opType}}</el-button>

      <span v-if="orders.length>0">一共{{orders.length}}个订单</span>
      <template v-if="failImportList.length>0">
        <p v-for="(item,index) in failImportList"
           :key="index">{{item.exCode}}已存在</p>
      </template>

    </el-form>
    <span slot="footer"
          class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>

    </span>
  </el-dialog>
</template>

<script>
import remoteSelect from '../../common/remoteSelect'
import XLSX from 'xlsx'
import vuedraggable from 'vuedraggable'

export default {
  name: 'order-import',
  components: {
    remoteSelect,
    vuedraggable
  },
  data () {
    return {
      inputOrderExcode: '',
      activeImportCol: 'excel',
      url: '',
      visible: false,
      dataForm: {
        originId: undefined,
        sellerMsg: undefined,
        remarks: undefined,
        opType: '设置',
        closeMake: false,
        allFilmId: undefined

      },
      orders: [],
      failImportList: []
    }
  },
  mounted () {
    this.url = this.$http.adornUrl(`/sys/oss/uploadZip?token=${this.$cookie.get('token')}`)
  },
  methods: {
    allfilmIdChange (value) {
      this.orders.forEach((o) => {
        o.list.forEach((od) => {
          console.log(od)
          od.filmId = value
        })
      })
      console.log(this.orders)
      this.$forceUpdate()
    },
    deleteImg (oindex, index, imgIndex) {
      this.orders[oindex].list[index].imgs.splice(imgIndex, 1)
      // this.$forceUpdate()
    },
    setImgAngle (oindex, index, imgIndex) {
      let img = this.orders[oindex].list[index].imgs[imgIndex]
      img.angle = img.angle ? img.angle + 1 : 1
      this.$forceUpdate()
    },
    filmIdChange (value, index, oindex) {
      this.orders[oindex].list[index].filmId = value
    },
    addFileDir (e) {
      let dirs = {}
      let files = Array.from(e.target.files)
      if (files.length === 0) {
        return
      }
      this.orders = []
      files.forEach((file) => {
        if (file.type.startsWith('image')) {
          let d = file.webkitRelativePath.substring(0, file.webkitRelativePath.lastIndexOf('/'))
          if (!dirs[d]) {
            dirs[d] = []
          }
          dirs[d].push(file)
        }
      })
      let num = Object.keys(dirs).length

      Object.keys(dirs).forEach((dir) => {
        dirs[dir] = dirs[dir].sort((f1, f2) => {
          let n1, n2
          n1 = parseInt(f1.name.split('.')[0])
          n2 = parseInt(f2.name.split('.')[0])
          if (isNaN(n1)) {
            n1 = 0
          }
          if (isNaN(n2)) {
            n2 = 0
          }

          return n1 - n2
        })
      })
      let orderList = []
      console.log(dirs)

      Object.keys(dirs).forEach((dir) => {
        let formData = new FormData()
        let split = dir.split('/')
        let tOrder = {
          exCode: split[split.length - 1],
          list: []
        }
        let arr = Array.from(dirs[dir])
        arr.forEach((f) => {
          formData.append('files', f)
        })
        this.$http({
          url: this.$http.adornUrl(`/sys/oss/uploads`),
          method: 'post',
          data: formData
        }).then(({ data }) => {
          let imgs = data.urls.map((url) => {
            return {
              number: 1,
              url: url,
              angle: 0
            }
          })
          tOrder.list.push({ imgs: imgs, number: 1 })
          orderList.push(tOrder)
          num--
          console.log(num)
          if (num === 0) {
            this.orders = orderList

            this.$forceUpdate()
          }
        })
      })
    },
    init () {
      this.visible = true
      this.failImportList = []
      this.orders = []
      this.inputOrderExcode = undefined
      this.dataForm.sellerMsg = undefined
      this.dataForm.remarks = undefined
    },
    originIdChange (value) {
      this.dataForm.originId = value
    },
    inputOrderExcodeChange (value) {
      let arr = value.trim().split('\n')
      this.orders = arr.filter((item, index) => {
        return arr.indexOf(item, 0) === index && item
      }).map((v) => {
        return {
          exCode: v.trim(),
          originId: this.dataForm.originId
        }
      })
      console.log(this.orders)
    },
    importExcelOrders (file, fileList) {
      this.orders = []
      this.failImportList = []
      let that = this
      readWorkbookFromLocalFile(file.raw, (workbook) => {
        let orders = []
        let maxLine = 0

        let arr = ['订单编号', '订单号']

        for (let sheetName in workbook.Sheets) {
          let sheet = workbook.Sheets[sheetName]
          let tag = sheet['!ref']
          console.log(sheet)
          maxLine = tag.split(':')[1].replace(/[^\d]/g, ' ')
          let col = 'A'
          for (let i = 0; i < 26; i++) {
            let tcol = String.fromCharCode(i + 65)
            if (sheet[tcol + 1] == null) {
              continue
            }
            let name = sheet[tcol + 1].v

            if (arr.indexOf(name) >= 0) {
              col = tcol
              break
            }
          }

          for (let i = 2; i <= maxLine; i++) {
            try {
              let exCode = sheet[col + i].v

              // let buyerMsg = sheet['N' + i].v === 'null' ? '' : sheet['N' + i].v
              // let sellerMsg = sheet['Z' + i].v === `'null` ? '' : sheet['Z' + i].v.slice(1)
              // let orderCreateTime = sheet['T' + i].v
              // let payTime = sheet['U' + i] ? sheet['U' + i].v : ''
              // let status = orderStatus(sheet['M' + i].v)
              // orders.push({ exCode, buyerMsg, sellerMsg, originId: 1, orderCreateTime, payTime, status })
              orders.push({ exCode, originId: this.dataForm.originId })
            } catch (e) {
              that.$alert('请选择淘宝订单格式的表格')
            }
          }
        }
        this.orders = orders
        console.log(orders)
      })
      function readWorkbookFromLocalFile (file, callback) {
        let reader = new FileReader()
        reader.onload = function (e) {
          let data = e.target.result
          let workbook
          // try {
          workbook = XLSX.read(data, { type: 'binary' })
          if (callback) callback(workbook)
          // } catch (e) {
          // let password = prompt('输入密码')
          // alert(password)
          // workbook = XLSX.read(data, { type: 'binary', password })
          // that.$alert('打开失败，若文件已加密，请先解密')
          // }
        }
        reader.readAsBinaryString(file)
      }
    },
    dataFormSubmit () {
      this.failImportList = []

      if (this.dataForm.originId === undefined) {
        this.$message('请先选择店铺')
        return
      }
      if (this.orders == null || this.orders.length === 0 || this.ordersWithDetail.length === 0) {
        this.$message('没有可以导入的订单')
        return
      }
      let loading = this.$loading({
        lock: true,
        text: '导入中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      if (this.dataForm.sellerMsg) {
        this.orders.forEach((o) => {
          o.sellerMsg = this.dataForm.sellerMsg
        })
      }
      if (this.dataForm.remarks) {
        this.orders.forEach((o) => {
          o.remarks = this.dataForm.remarks
        })
      }
      if (this.dataForm.closeMake) {
        this.orders.forEach((o) => {
          o.status = 5
        })
      }
      this.orders.forEach((o) => {
        o.originId = this.dataForm.originId
      })
      this.$http({
        url: this.$http.adornUrl('/generator/order/import'),
        method: 'POST',
        data: this.orders,
        params: this.$http.adornParams({ opType: this.dataForm.opType, sellerMsg: this.dataForm.sellerMsg })
      }).then(({ data }) => {
        this.$message(data.msg)
        if (data.failNumber > 0) {
          this.failImportList = data.failList
        } else {
          this.visible = false
        }
        loading.close()
        this.$emit('refreshDataList')
        // this.visible = false
      })
    }
  }
}
</script>
<style scoped>
@import url("../../common/css/userImgs.css");
.btn-addFiles {
  position: relative;
}

.btn-addFiles input {
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0;

  position: absolute;
  cursor: pointer;
}
</style>
