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

      <el-collapse v-model="activeImportCol"
                   accordion>
        <el-collapse-item title="excel表格导入"
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

      </el-collapse>
      <br />

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

export default {
  components: {
    remoteSelect
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
        closeMake: false

      },
      orders: [],
      failImportList: []
    }
  },
  mounted () {
    this.url = this.$http.adornUrl(`/sys/oss/uploadZip?token=${this.$cookie.get('token')}`)
  },
  methods: {
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
      if (this.orders == null || this.orders.length === 0) {
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
