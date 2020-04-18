<template>
  <div class="mod-config">
    <el-form :inline="true"
             :model="dataForm"
             @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key"
                  placeholder="参数名"
                  clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>

      </el-form-item>
    </el-form>
    <div>
      <el-button v-if="isAuth('generator:order:save')"
                 type="primary"
                 @click="addOrUpdateHandle()">引入订单</el-button>
      <el-button v-if="isAuth('generator:order:save')"
                 type="primary"
                 @click="importHandle()">批量导入订单</el-button>

      <el-button v-if="isAuth('generator:order:delete')"
                 type="danger"
                 @click="deleteHandle()"
                 :disabled="dataListSelections.length <= 0">批量删除
      </el-button>
    </div>
    <br />
    <el-table :data="dataList"
              border
              v-loading="dataListLoading"
              @selection-change="selectionChangeHandle"
              @cell-click="cellClickHandle"
              default-expand-all
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
      <el-table-column prop="code"
                       header-align="center"
                       align="center"
                       label="系统内部订单编号"
                       width="200">
      </el-table-column>
      <el-table-column prop="exCode"
                       header-align="center"
                       align="center"
                       width="200"
                       label="外部订单编号">

      </el-table-column>
      <!-- <el-table-column prop="status"
                       header-align="center"
                       align="center"
                       label="订单状态">
        <template slot-scope="scope">
          <el-tag :type="orderStatus[scope.row.status].type">{{orderStatus[scope.row.status].text}}</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="详情"
                       width="200">
        <template slot-scope="scope">
          <div v-for="(d,index) in scope.row.list"
               :key="d.filmName">
            {{d.number}}个{{d.filmName}}
            <el-popover placement="top-start"
                        width="200"
                        trigger="hover">
              <el-tag slot="reference"
                      :type="orderDetailStatus[d.status].type">{{orderDetailStatus[d.status].text}}</el-tag>

              <template v-if="d.printUrl">
                <br />
                <a :href="d.printUrl +'?x-oss-process=style/h150'"
                   target="_bank">查看效果图</a>
              </template>

              <template>
                <br />
                <a href="#"
                   @click.prevent="redo(d.id)">重做</a>
              </template>
            </el-popover>

            <div v-if="index<scope.row.list.length-1"
                 class="divider"></div>
          </div>

        </template>
      </el-table-column>

      <!-- <el-table-column prop="buyerMsg"
                       header-align="center"
                       align="center"
                       label="买家留言">
      </el-table-column> -->
      <el-table-column prop="sellerMsg"
                       header-align="center"
                       align="center"
                       label="卖家留言">
      </el-table-column>
      <el-table-column prop="orderCreateTime"
                       header-align="center"
                       align="center"
                       label="下单时间"
                       width="100">
      </el-table-column>
      <el-table-column prop="payTime"
                       header-align="center"
                       align="center"
                       label="支付时间">
      </el-table-column>
      <el-table-column prop="createTime"
                       header-align="center"
                       align="center"
                       label="导入时间">
      </el-table-column>
      <el-table-column prop="originName"
                       header-align="center"
                       align="center"
                       label="来源">
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
    <OrderImport v-if="orderImportVisible"
                 ref="orderImport"
                 @refreshDataList="getDataList"></OrderImport>
  </div>
</template>

<script>
import AddOrUpdate from './order-add-or-update'
import OrderImport from './order-import.vue'
import orderDetailStatus from './orderDetailStatus.js'
export default {
  data () {
    return {
      orderStatus: {
        '1': { text: '待付款', type: 'warning' },
        '2': { text: '未初始化', type: 'warning' },
        '3': { text: '制作中', type: '' },
        '4': { text: '制作完成', type: 'success' },
        '5': { text: '关闭', type: 'info' },
        '6': { text: '不可制作', type: 'info' }
      },
      orderDetailStatus: orderDetailStatus,
      dataForm: {
        key: ''
      },
      currentCellDetail: undefined,
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      orderImportVisible: false
    }
  },
  components: {
    AddOrUpdate,
    OrderImport
  },
  activated () {
    this.getDataList()
  },
  computed: {

  },
  methods: {
    redo (id) {
      this.$http({
        url: this.$http.adornUrl(`/generator/orderdetail/redo/${id}`),
        method: 'put'
      }).then(({ data }) => {
        console.log(data)
        this.getDataList()
      })
    },
    search () {

    },
    // 获取数据列表
    getDataList (map) {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/generator/order/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'key': this.dataForm.key
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
    cellClickHandle (row) {
      // this.$http({
      //   url: this.$http.adornUrl('/generator/orderdetail/listByOrder/' + row.id),
      //   method: 'get'
      // }).then(({ data }) => {
      //   if (data && data.code === 0) {
      //     this.currentCellDetail = data.list
      //   }
      // })
    },
    // 新增 / 修改
    importHandle () {
      this.orderImportVisible = true
      this.$nextTick(() => {
        this.$refs.orderImport.init()
      })
    },
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
          url: this.$http.adornUrl('/generator/order/delete'),
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
