<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">

    <el-form :model="dataForm"
             ref="dataForm"
             @keyup.enter.native="dataFormSubmit()"
             label-width="80px">

      <el-form-item style="display:inline-block"
                    label="店铺"
                    prop="originId">
        <remoteSelect v-if="visible"
                      :model="dataForm"
                      type="origin"
                      fild="originId"
                      label="origin"
                      value="id"
                      @change="originIdChange"></remoteSelect>
      </el-form-item>
      <el-upload style="display:inline-block"
                 ref="upload"
                 action="#"
                 :multiple="false"
                 :show-file-list="false"
                 :on-change="importOrders"
                 :auto-upload="false">
        <el-button slot="trigger"
                   type="primary">选择订单excel表格</el-button>

      </el-upload>
      <span v-if="orders.length>0">一共{{orders.length}}个订单</span>
      <template v-if="failImportList.length>0">
        <p v-for="(item,index) in failImportList"
           :key="index">{{item.exCode}}已存在</p>
      </template>
      <br />
      <el-button type="primary"
                 @click="dataFormSubmit()">导入</el-button>

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
      url: '',
      visible: false,
      dataForm: {
        originId: undefined
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
    },
    originIdChange (value) {
      this.dataForm.originId = value
    },
    importOrders (file, fileList) {
      this.orders = []
      this.failImportList = []
      readWorkbookFromLocalFile(file.raw, (workbook) => {
        let orders = []
        let maxLine = 0
        for (let sheetName in workbook.Sheets) {
          let sheet = workbook.Sheets[sheetName]
          let tag = sheet['!ref']
          maxLine = tag.split(':')[1].replace(/[^\d]/g, ' ')
          for (let i = 2; i <= maxLine; i++) {
            try {
              let exCode = sheet['A' + i].v

              // let buyerMsg = sheet['N' + i].v === 'null' ? '' : sheet['N' + i].v
              // let sellerMsg = sheet['Z' + i].v === `'null` ? '' : sheet['Z' + i].v.slice(1)
              // let orderCreateTime = sheet['T' + i].v
              // let payTime = sheet['U' + i] ? sheet['U' + i].v : ''
              // let status = orderStatus(sheet['M' + i].v)
              // orders.push({ exCode, buyerMsg, sellerMsg, originId: 1, orderCreateTime, payTime, status })
              orders.push({ exCode, originId: 1 })
            } catch (e) {
              this.$alert('请选择淘宝订单格式的表格')
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
          try {
            workbook = XLSX.read(data, { type: 'binary' })
            if (callback) callback(workbook)
          } catch (e) {
            // let password = prompt('输入密码')
            // alert(password)
            // workbook = XLSX.read(data, { type: 'binary', password })
            this.$alert('未知错误')
          }
        }
        reader.readAsBinaryString(file)
      }
    },
    dataFormSubmit () {
      if (this.dataForm.originId === undefined) {
        this.$message('请先选择订单来源')
        return
      }
      let loading = this.$loading({
        lock: true,
        text: '导入中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$http({
        url: this.$http.adornUrl('/generator/order/saveFromExcel'),
        method: 'POST',
        data: this.orders
      }).then(({ data }) => {
        this.$message(data.msg)
        if (data.failNumber > 0) {
          this.failImportList = data.failList
        }
        loading.close()
        this.$emit('refreshDataList')
        // this.visible = false
      })
    }
  }
}
</script>
