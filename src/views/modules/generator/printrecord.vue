<template>
  <div class="mod-config">
    <el-form :inline="true"
             :model="dataForm"
             @keyup.enter.native="getDataList()">
      <el-form-item label="流水号">
        <el-input type="number"
                  v-model="dataForm.id"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="状态：">
        <el-select clearable
                   v-model="dataForm.status"
                   placeholder="请选择">
          <el-option v-for="item in printRecordStatus"
                     :key="item.value"
                     :label="item.text"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="search()">查询</el-button>
        <el-button type="primary"
                   @click="download">批量下载</el-button>
        <el-button v-if="isAuth('generator:printrecord:download')"
                   type="primary"
                   @click="loadPrint">下载所有可打印文件</el-button>
        <!-- <el-button v-if="isAuth('generator:printrecord:save')"
                   type="primary"
                   @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('generator:printrecord:delete')"
                   type="danger"
                   @click="deleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除</el-button> -->
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
      <el-table-column prop="id"
                       header-align="center"
                       align="center"
                       label="流水号">
      </el-table-column>
      <el-table-column prop="filmId"
                       header-align="center"
                       align="center"
                       label="胶卷id">
      </el-table-column>
      <el-table-column prop="paperId"
                       header-align="center"
                       align="center"
                       label="打印纸id">
      </el-table-column>
      <el-table-column prop="printUrl"
                       header-align="center"
                       align="center"
                       label="打印文件">
        <template slot-scope="scope">
          <img style="width:100%;max-height:150px;object-fit: contain"
               :src="scope.row.printUrl +'?x-oss-process=style/200x'"
               alt="">
          <a :href="scope.row.printUrl"
             target="_blank">查看原图</a>
        </template>
      </el-table-column>
      <el-table-column prop="status"
                       header-align="center"
                       align="center"
                       label="状态">
        <template slot-scope="scope">
          {{printRecordStatus[scope.row.status].text}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime"
                       header-align="center"
                       align="center"
                       label="创建时间">
      </el-table-column>
      <el-table-column prop="outTime"
                       header-align="center"
                       align="center"
                       label="最近导出时间">

        <template slot-scope="scope">
          {{scope.row.outTime?scope.row.outTime:'暂无导出'}}
        </template>
      </el-table-column>
      <el-table-column fixed="right"
                       header-align="center"
                       align="center"
                       width="150"
                       label="操作">
        <template slot-scope="scope">
          <el-button type="text"
                     size="small"
                     @click="downloadHandle(scope.row)">下载</el-button>
          <!-- <el-button type="text"
                     size="small"
                     @click="deleteHandle(scope.row.id)">删除</el-button> -->
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
import AddOrUpdate from './printrecord-add-or-update'
import loadImages from '../../../utils/loadImages.js'
import printRecordStatus from './status/printRecordStatus.js'
import {
  saveAs
} from 'file-saver'
export default {
  data () {
    return {
      printRecordStatus: printRecordStatus,
      dataForm: {
        id: '',
        status: ''
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
    download () {
      let loading = this.$loading({
        lock: true,
        text: '正在生成下载包，时间较长，请耐心等待',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.downloadPrintRecord(this.dataListSelections).then((data) => {
        if (data && data.code === 0) {
          loadImages(this.dataListSelections.map((record) => {
            return { url: record.printUrl, name: record.id }
          }), () => {
            loading.close()
            this.dataListLoading = false
          })
        }
      })
    },
    loadPrint () {
      let loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.dataListLoading = true

      this.$http({
        url: this.$http.adornUrl('/generator/printrecord/listCanPrint'),
        method: 'get'
      }).then(({ data }) => {
        this.dataListLoading = false
        if (data && data.code === 0) {
          console.log(data.list)
          loadImages(data.list.map((record) => {
            return record.printUrl
          }), () => {
            loading.close()
          })
        }
      })
    },
    search () {
      this.pageIndex = 1
      this.getDataList()
    },
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/generator/printrecord/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'id': this.dataForm.id,
          'status': this.dataForm.status
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
          url: this.$http.adornUrl('/generator/printrecord/delete'),
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
    },
    // 下载
    downloadHandle (row) {
      this.downloadPrintRecord([row]).then(() => {
        saveAs(row.printUrl, '流水号' + row.id + '.png')
      })
    },
    downloadPrintRecord (records) {
      let that = this
      return new Promise((resolve, reject) => {
        this.$http({
          url: this.$http.adornUrl('/generator/printrecord/download'),
          method: 'post',
          data: JSON.stringify({
            'records': records
          })
        }).then(({ data }) => {
          that.getDataList()
          resolve(data)
        })
      })
    }
  }
}
</script>
