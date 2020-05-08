<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible">
    <el-alert title="请勿在同一个店铺将同一个SKU关联到不同的制作模板"
              :closable="false"
              type="warning">
    </el-alert>
    <p></p>
    <el-form :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             label-width="80px">
      <el-form-item label="店铺"
                    prop="originId">
        <remoteSelect :model="dataForm"
                      type="origin"
                      fild="originId"
                      label="origin"
                      value="id"
                      :disabled="dataForm.id?true:false"
                      @change="originIdChange">
        </remoteSelect>
      </el-form-item>

      <el-form-item label="SKU"
                    prop="marker">
        <div class="layout-row">

          <el-select v-model="dataForm.marker"
                     multiple
                     filterable
                     allow-create
                     default-first-option
                     no-data-text="输入标识按回车即可">
            <el-option v-for="item in []"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
          <el-button v-if="dataForm.originId==1 ||dataForm.originId==3"
                     @click="openTaobaoGoodsListHandle">打开淘宝店铺商品列表</el-button>
          <el-dialog append-to-body
                     title="淘宝出售中的商品"
                     width="300"
                     :visible.sync="openTaobaoGoodsList">
            <div class="taobaoGoods">
              <div class="layout-row goods"
                   v-for="item in taobaoGoods"
                   :key="item.title">
                <img :src="item.picUrl"
                     alt="">

                <div class="skus">
                  <p>{{item.title}}</p>
                  <el-checkbox-group v-model="dataForm.marker"
                                     class="cheboxs">
                    <template v-for="sku in item.skus">
                      <el-checkbox class="chebox"
                                   v-if="sku.outerId"
                                   :key="sku.outerId"
                                   :label="sku.outerId">{{sku.outerId}}{{sku.propertiesName}}</el-checkbox>

                    </template>
                  </el-checkbox-group>

                </div>

                <!-- <el-checkbox v-model="checked">item.</el-checkbox> -->
              </div>
            </div>
          </el-dialog>

        </div>
        <!-- <el-input v-model="dataForm.marker"
                  placeholder="胶卷标识"></el-input> -->
      </el-form-item>
      <el-form-item label="模板"
                    prop="filmId">
        <remoteSelect :model="dataForm"
                      fild="filmId"
                      type="film"
                      label="name"
                      value="id"
                      @change="filmIdChange"></remoteSelect>
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
export default {
  name: 'merge',
  components: {
    remoteSelect
  },
  data () {
    return {
      openTaobaoGoodsList: false,
      taobaoGoods: [],
      filmSelect: {
        options: [],
        loading: false
      },
      visible: false,
      dataForm: {
        id: undefined,
        originId: undefined,
        marker: '',
        filmId: undefined
      },
      dataRule: {
        originId: [
          { required: true, message: '来源地不能为空', trigger: 'blur' }
        ],
        marker: [
          { required: true, message: 'SKU不能为空', trigger: 'blur' }
        ],
        filmId: [
          { required: true, message: '胶卷模板不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    openTaobaoGoodsListHandle () {
      if (this.dataForm.originId) {
        this.openTaobaoGoodsList = true
        this.$http({
          url: this.$http.adornUrl(`/generator/filmoriginmerge/onSellerGoods/${this.dataForm.originId}`),
          method: 'get'
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.processGoods(data.goods, data.skus)

            this.taobaoGoods = data.goods
            // this.skus = data.skus
          }
        })
      } else {
        this.$message.error('请先选择店铺')
      }
    },
    processGoods (goods, skus) {
      let getIndex = (numiid) => {
        for (let i = 0, len = goods.length; i < len; i++) {
          console.log(numiid, goods[i].NumIid)
          if (goods[i].numIid === numiid) {
            return i
          }
        }
      }
      skus.forEach((sku) => {
        console.log(sku)
        let index = getIndex(sku.numIid)
        sku.propertiesName = sku.propertiesName.replace(sku.properties.split(';')[0] + ':颜色分类', '').split(';')[0]

        if (goods[index].skus != null) {
          goods[index].skus.push(sku)
        } else {
          goods[index].skus = []
          goods[index].skus.push(sku)
        }
      })
      console.log(goods)
    },
    filmIdChange (value) {
      this.dataForm.filmId = value
    },
    originIdChange (value) {
      this.dataForm.originId = value
    },
    remoteFilmMethod (query) {
      this.filmSelect.loading = true
      this.$http({
        url: this.$http.adornUrl('/generator/film/list'),
        method: 'get',
        params: this.$http.adornParams({
          'key': query
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.filmSelect.options = data.page.list
        } else {
          this.filmSelect.options = []
        }
        this.filmSelect.loading = false
      })
    },
    init (id) {
      this.taobaoGoods = []
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/generator/filmoriginmerge/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.originId = data.filmOriginMerge.originId
              this.dataForm.marker = data.filmOriginMerge.marker.split(',')
              this.dataForm.filmId = data.filmOriginMerge.filmId
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
            url: this.$http.adornUrl(`/generator/filmoriginmerge/${!this.dataForm.id ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'originId': this.dataForm.originId,
              'marker': this.dataForm.marker.join(','),
              'filmId': this.dataForm.filmId
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
  },
  mounted () {
  }

}
</script>
<style scoped>
.taobaoGoods {
  height: 300px;
  overflow: scroll;
}
.goods img {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  margin-bottom: 10px;
}
.goods {
}
.goods .skus {
  width: 100%;
}
</style>
