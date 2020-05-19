<template>
  <div class="mod-config">
    <el-form :inline="true"
             :model="dataForm"
             @keyup.enter.native="getDataList()">
      <el-form-item label="学号">
        <el-input v-model="dataForm.stuNum"
                  placeholder="学号"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="dataForm.name"
                  placeholder="姓名"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="班级">
        <el-input v-model="dataForm.grade"
                  placeholder="班级"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="dataForm.sex"
                   clearable=""
                   placeholder="请选择">
          <el-option v-for="item in options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <!-- <el-form-item label="身高">
        <el-input placeholder="请输入内容"
                  v-model="dataForm.height"
                  class="input-with-select">
          <el-select v-model="dataForm.heightFlag"
                     slot="prepend">
            <el-option label="大于"
                       value="1">大于</el-option>
            <el-option label="小于"
                       value="2"></el-option>
            <el-option label="等于"
                       value="0"></el-option>
          </el-select>

        </el-input>
      </el-form-item> -->
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('generator:record:save')"
                   type="primary"
                   @click="addOrUpdateHandle()">新增</el-button>
        <el-upload style="display:inline-block"
                   ref="upload"
                   action="#"
                   accept=".xlsx"
                   :multiple="false"
                   :show-file-list="false"
                   :on-change="importHandle"
                   :auto-upload="false">
          <el-button slot="trigger">批量导入</el-button>

        </el-upload>

        <el-button v-if="isAuth('generator:record:save')"
                   @click="exportHandle()"
                   :disabled="dataListSelections.length <= 0">导出excel</el-button>
        <el-button v-if="isAuth('generator:record:delete')"
                   type="danger"
                   @click="deleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList"
              border
              v-loading="dataListLoading"
              @selection-change="selectionChangeHandle"
              style="width: 100%;">
      <el-table-column type="selection"
                       header-align="center"
                       align="center"
                       width="50">
      </el-table-column>
      <!-- <el-table-column prop="id"
                       header-align="center"
                       align="center"
                       label="id">
      </el-table-column> -->
      <el-table-column prop="stuNum"
                       header-align="center"
                       align="center"
                       label="学号">
      </el-table-column>
      <el-table-column prop="name"
                       header-align="center"
                       align="center"
                       label="姓名">
      </el-table-column>
      <el-table-column prop="grade"
                       header-align="center"
                       align="center"
                       label="班级">
      </el-table-column>
      <el-table-column prop="sex"
                       header-align="center"
                       align="center"
                       label="性别">
        <template slot-scope="scope">

          {{sexs[scope.row.sex]}}
        </template>
      </el-table-column>
      <el-table-column prop="height"
                       header-align="center"
                       align="center"
                       label="身高">
      </el-table-column>
      <el-table-column prop="weight"
                       header-align="center"
                       align="center"
                       label="体重">
      </el-table-column>

      <el-table-column prop="vitalCapacity"
                       header-align="center"
                       align="center"
                       label="肺活量">
      </el-table-column>
      <el-table-column prop="longDistanceRun"
                       header-align="center"
                       align="center"
                       label="长跑成绩">
      </el-table-column>
      <el-table-column prop="dash"
                       header-align="center"
                       align="center"
                       label="短跑成绩">
      </el-table-column>
      <el-table-column prop="longJump"
                       header-align="center"
                       align="center"
                       label="跳远">
      </el-table-column>
      <el-table-column fixed="right"
                       header-align="center"
                       align="center"
                       width="150"
                       label="操作">
        <template slot-scope="scope">
          <el-button type="text"
                     size="small"
                     @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button type="text"
                     size="small"
                     @click="deleteHandle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle"
                   @current-change="currentChangeHandle"
                   :current-page="pageIndex"
                   :page-sizes="[10, 20, 50, 100]"
                   :page-size="pageSize"
                   :total="totalPage"
                   layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible"
                   ref="addOrUpdate"
                   @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './record-add-or-update'
// import FileSaver from 'file-saver'
import XLSX from 'xlsx'
export default {
  data () {
    return {
      sexs: ['女', '男', '未知'],
      sexOri: {
        '女': 0,
        '男': 1,
        '未知': 2
      },
      options: [{
        value: 0,
        label: '女'
      }, {
        value: 1,
        label: '男'
      }, {
        value: 2,
        label: '保密'
      }],
      dataForm: {
        stuNum: '',
        name: '',
        grade: '',
        sex: '',
        height: '',
        heightFlag: 2

      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  components: {
    AddOrUpdate
  },
  activated () {
    this.getDataList()
  },
  methods: {
    importHandle (file) {
      this.failImportList = []
      readWorkbookFromLocalFile(file.raw, (workbook) => {
        let records = []
        let maxLine = 0

        for (let sheetName in workbook.Sheets) {
          let sheet = workbook.Sheets[sheetName]
          let tag = sheet['!ref']
          console.log(sheet)
          maxLine = tag.split(':')[1].replace(/[^\d]/g, ' ')
          for (let i = 2; i <= maxLine; i++) {
            try {
              // _data.push([row.stuNum, row.name, row.grade, this.sexs[row.sex], row.height, row.weight, row.vitalCapacity, row.longDistanceRun, row.dash, row.longJump])

              let stuNum = sheet['A' + i].v
              let name = sheet['B' + i].v
              let grade = sheet['C' + i].v
              let sex = this.sexOri[sheet['D' + i].v]
              let height = sheet['E' + i].v
              let weight = sheet['F' + i].v
              let vitalCapacity = sheet['G' + i].v
              let longDistanceRun = sheet['H' + i].v
              let dash = sheet['I' + i].v
              let longJump = sheet['J' + i].v
              records.push({ stuNum, name, grade, sex, height, weight, vitalCapacity, longDistanceRun, dash, longJump })
            } catch (e) {
            }
          }
        }
        console.log(records)
        this.$http({
          url: this.$http.adornUrl(`/generator/record/saves`),
          method: 'post',
          data: { records }
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
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
    exportHandle () {
      var _data = [
        ['学号', '姓名', '班级', '性别', '身高', '体重', '肺活量', '长跑成绩', '短跑成绩', '跳远']
      ]
      this.dataListSelections.forEach((row) => {
        _data.push([row.stuNum, row.name, row.grade, this.sexs[row.sex], row.height, row.weight, row.vitalCapacity, row.longDistanceRun, row.dash, row.longJump])
      })
      const ws = XLSX.utils.aoa_to_sheet(_data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      XLSX.writeFile(wb, '学生健康信息表.xlsx')
    },
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/generator/record/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'stuNum': this.dataForm.stuNum,
          'name': this.dataForm.name,
          'grade': this.dataForm.grade,
          'sex': this.dataForm.sex
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalCount
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    // 每页数
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })

      this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/generator/record/delete'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    }
  }
}
</script>
