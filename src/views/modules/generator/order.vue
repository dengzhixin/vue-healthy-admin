<template>
  <div class="mod-config">
    <el-form :inline="true"
             :model="dataForm"
             label-position="left"
             label-width="100px"
             @keyup.enter.native="getDataList()">
      <el-form-item label="标题：">
        <el-input v-model="dataForm.title"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="状态：">
        <el-select v-model="dataForm.odStatus"
                   clearable>
          <el-option v-for="item in orderDetailStatus"
                     :key="item.value"
                     :label="item.text"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="颜色分类">
        <el-input v-model="dataForm.skuName"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="系统编号：">
        <el-input v-model="dataForm.code"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="订单号：">
        <el-input v-model="dataForm.excode"
                  clearable></el-input>
      </el-form-item>

      <el-form-item label="店铺"
                    prop="originId">
        <remoteSelect :model="dataForm"
                      type="origin"
                      fild="originId"
                      label="origin"
                      value="id"
                      :clearable='true'
                      @change="originIdChange">
        </remoteSelect>
      </el-form-item>
      <el-form-item label="买家昵称">
        <el-input v-model="dataForm.buyerNick"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="下单时间：">
        <el-date-picker v-model="dataForm.time"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        align="right">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button @click="search()">查询</el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-button v-if="isAuth('generator:order:manualCreate')"
                 type="primary"
                 @click="addOrUpdateHandle(null,1)">新建订单</el-button>
      <el-button v-if="isAuth('generator:order:save')"
                 type="primary"
                 @click="addOrUpdateHandle(null,0)">引入订单</el-button>
      <el-button v-if="isAuth('generator:order:import')"
                 type="primary"
                 @click="importHandle()">导入订单</el-button>
      <el-button v-if="isAuth('generator:order:syncOrderStatus')"
                 type="primary"
                 @click="syncHandle()"
                 :disabled="dataListSelections.length <= 0">批量同步订单状态</el-button>
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
      <el-table-column label="详情"
                       width="600">
        <template slot-scope="scope">
          <div v-for="(d,index) in scope.row.list"
               :key="index">
            <div class="layout-row od">
              <img v-if="d.picPath"
                   class="odImg"
                   :src="d.picPath">
              <i v-else
                 class="el-icon-picture-outline odImg"></i>

              <div class="layout-col">
                <template v-if="d.title"> {{d.title}}<br /></template>
                <template v-if="d.skuName"> {{d.skuName}}<br /></template>
                <div class="layout-row jscenter">
                  关联模板:{{d.filmName?d.filmName:'无'}}
                  数量：
                  <el-popover v-if="d.number>1 && d.filmName"
                              placement="top-start"
                              width="200"
                              trigger="hover">
                    <el-tag slot="reference">{{d.number}}</el-tag>
                    <el-button type="text"
                               @click="splitOrderDetail(d)">拆分</el-button>

                  </el-popover>
                  <el-tag v-else>{{d.number}}</el-tag>

                </div>
                <el-popover placement="top-start"
                            width="400"
                            trigger="hover">
                  <el-steps :active="stepActive(scope.row.status,d.status)"
                            simple
                            :process-status="stepStatus(scope.row.status,d.status)">
                    <el-step title="付款"></el-step>
                    <el-step title="预处理"></el-step>
                    <el-step title="打印"></el-step>
                    <el-step title="制作"></el-step>
                  </el-steps>

                  <el-tag v-if="scope.row.status!=1"
                          slot="reference"
                          :type="orderDetailStatus[d.status].type">{{orderDetailStatus[d.status].text}}</el-tag>
                  <el-tag v-else
                          slot="reference"
                          :type="orderStatus[scope.row.status].type">{{orderStatus[scope.row.status].text}}</el-tag>
                  <template v-if="d.printUrl">
                    <br />
                    <el-link icon="el-icon-picture"
                             :href="d.printUrl +'?x-oss-process=style/h150'"
                             target="_bank">查看效果图</el-link>
                  </template>
                  <template>
                    <br />
                    <a href="#"
                       @click.prevent="edit(scope.row,index,d.id)"><i class="el-icon-edit-outline"></i>修改</a>
                  </template>
                  <template v-if="d.status==4 && d.printUrl">
                    <br />
                    <a href="#"
                       @click.prevent="redo(scope,index,d.id)"><i class="el-icon-refresh"></i>重做</a>
                  </template>

                </el-popover>
              </div>
            </div>

            <div v-if="index<scope.row.list.length-1"
                 class="divider"></div>
          </div>

        </template>
      </el-table-column>
      <el-table-column prop="buyerNick"
                       header-align="center"
                       align="center"
                       width="100"
                       label="买家">
        <template slot-scope="scope">
          {{scope.row.buyerNick}}
          <el-tooltip class="item"
                      effect="dark"
                      :content="scope.row.buyerNick"
                      placement="bottom">
            <a target="_blank"
               :href="'http://www.taobao.com/webww/ww.php?ver=3&touid='+scope.row.buyerNick+'&siteid=cntaobao&status=1&charset=utf-8'"><img border="0"
                   :src="'http://amos.alicdn.com/realonline.aw?v=2&uid='+scope.row.buyerNick+'&site=cntaobao&s=1&charset=utf-8'">
            </a>
          </el-tooltip>

        </template>
      </el-table-column>
      <el-table-column prop="code"
                       header-align="center"
                       align="center"
                       label="系统编号"
                       width="200">
      </el-table-column>
      <el-table-column prop="exCode"
                       header-align="center"
                       align="center"
                       width="200"
                       label="订单号">

      </el-table-column>

      <!-- <el-table-column prop="status"
                       header-align="center"
                       align="center"
                       label="订单状态">
        <template slot-scope="scope">
          <el-tag :type="orderStatus[scope.row.status].type">{{orderStatus[scope.row.status].text}}</el-tag>
        </template>
      </el-table-column> -->

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
      <el-table-column prop="remarks"
                       header-align="center"
                       align="center"
                       label="系统备注">
        <template slot-scope="scope">
          {{scope.row.remarks}}
          <el-button type="text"
                     size="small"
                     @click="addOrUpdateHandle(scope.row.id)">编辑</el-button>
        </template>

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
                       label="店铺">
      </el-table-column>
      <el-table-column prop="type"
                       header-align="center"
                       align="center"
                       label="订单类型">
        <template slot-scope="scope">{{scope.row.type===0?'平台':'人工'}}</template>
      </el-table-column>
      <!-- <el-table-column fixed="right"
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
      </el-table-column> -->

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
    <add-or-update-order-detail v-if="addOrUpdateOrderDetailVisible"
                                ref="AddOrUpdateOrderDetail"
                                @refreshDataList="getDataList">
    </add-or-update-order-detail>
    <OrderImport v-if="orderImportVisible"
                 ref="orderImport"
                 @refreshDataList="getDataList"></OrderImport>
  </div>
</template>

<script>
import AddOrUpdate from './order-add-or-update'
import AddOrUpdateOrderDetail from './orderdetail-add-or-update'

import OrderImport from './order-import.vue'
import orderDetailStatus from './orderDetailStatus.js'
import remoteSelect from '../../common/remoteSelect'

export default {
  name: 'order',
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
        code: '',
        excode: '',
        odStatus: '',
        time: ['', ''],
        title: '',
        skuName: '',
        originId: '',
        buyerNick: ''
      },
      currentCellDetail: undefined,
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      orderImportVisible: false,
      addOrUpdateOrderDetailVisible: false

    }
  },
  components: {
    AddOrUpdate,
    OrderImport,
    AddOrUpdateOrderDetail,
    remoteSelect
  },
  activated () {
    this.getDataList()
  },
  computed: {
    stepActive (ostatus, status) {
      return function (ostatus, status) {
        if (ostatus === 1) {
          return 0
        }
        switch (status) {
          case 8:
            return 0
          case 1:
          case 2:
          case 5:
          case 6:
          case 7:
          case 10:
            return 1
          case 3:
            return 2
          case 9:
            return 3
          case 4:
            return 4
        }
      }
    },
    stepStatus (ostatus, status) {
      return function (ostatus, status) {
        if (ostatus === 1) {
          return 'error'
        }
        switch (status) {
          case 1:
          case 2:
            return 'wait'
          case 5:
          case 6:
          case 7:
          case 8:
            return 'error'
          case 9:
          case 3:
          case 10:
            return 'process'
          case 4:
            return 'success'
        }
      }
    }
  },
  methods: {
    originIdChange (value) {
      this.dataForm.originId = value
    },
    splitOrderDetail (od) {
      this.$prompt('请输入拆分数量格式(例：3个拆分为2个和1个，则输入2+1)', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let split = value.split('+')
        let sum = 0
        split.forEach((s) => {
          sum += parseInt(s)
        })
        if (sum !== od.number) {
          this.$message.error('输入的数量加起来必须和拆分前数量一致')
          return
        }
        this.$http({
          url: this.$http.adornUrl(`/generator/orderdetail/split/${od.id}/${value}`),
          method: 'put'
        }).then(({ data }) => {
          if (data && data.code === 0) {
            console.log(data)
            this.getDataList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消拆分'
        })
      })
    },
    search () {
      this.pageIndex = 1
      this.getDataList()
    },
    edit (row, index, id) {
      console.log(row)
      this.addOrUpdateOrderDetailVisible = true
      this.$nextTick(() => {
        this.$refs.AddOrUpdateOrderDetail.init(id)
      })
    },
    redo (row, index, id) {
      let loading = this.$loading({
        lock: true,
        text: '制作发送重做请求',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$http({
        url: this.$http.adornUrl(`/generator/orderdetail/redo/${id}`),
        method: 'put'
      }).then(({ data }) => {
        this.getDataList()
      })
      setTimeout(() => {
        loading.close()
        this.getDataList()
      }, 1000)
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
          'code': this.dataForm.code,
          'excode': this.dataForm.excode,
          'originId': this.dataForm.originId,
          'odStatus': this.dataForm.odStatus,
          'title': this.dataForm.title,
          'skuName': this.dataForm.skuName,
          'buyerNick': this.dataForm.buyerNick,
          'timeStart': this.dataForm.time[0] === '' ? '' : this.dataForm.time[0].Format('yyyy-MM-dd hh:mm:ss'),
          'timeEnd': this.dataForm.time[1] === '' ? '' : this.dataForm.time[1].Format('yyyy-MM-dd hh:mm:ss')
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
    addOrUpdateHandle (id, type) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id, type)
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
    },
    syncHandle (id) {
      let loading = this.$loading({
        lock: true,
        text: '订单状态正在同步中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })

      this.$http({
        url: this.$http.adornUrl('/generator/order/syncOrderStatus'),
        method: 'post',
        data: this.$http.adornData(ids, false)
      }).then(({ data }) => {
        loading.close()
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
    }
  }
}
</script>
<style scoped>
.odImg {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  font-size: 80px;
}
</style>